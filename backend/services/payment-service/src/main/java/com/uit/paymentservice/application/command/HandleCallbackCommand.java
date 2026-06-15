package com.uit.paymentservice.application.command;

import com.uit.paymentservice.domain.model.PaymentTransaction;
import com.uit.paymentservice.domain.repository.PaymentRepository;
import com.uit.paymentservice.infrastructure.gateway.PaymentGatewayFactory;
import com.uit.paymentservice.domain.gateway.GatewayCallbackResult;
import com.uit.paymentservice.infrastructure.messaging.PaymentEventPublisher;
import com.uit.paymentservice.domain.event.PaymentSucceededEvent;
import com.uit.paymentservice.domain.event.PaymentFailedEvent;
import com.uit.paymentservice.application.exception.InvalidSignatureException;
import com.uit.paymentservice.application.exception.PaymentNotFoundException;
import com.uit.paymentservice.application.exception.InvalidPaymentStateException;
import com.uit.paymentservice.domain.model.PaymentGatewayType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

@Service
public class HandleCallbackCommand {

    private static final Logger log = LoggerFactory.getLogger(HandleCallbackCommand.class);

    private final PaymentRepository paymentRepository;
    private final PaymentGatewayFactory gatewayFactory;
    private final PaymentEventPublisher eventPublisher;

    public HandleCallbackCommand(
            PaymentRepository paymentRepository,
            PaymentGatewayFactory gatewayFactory,
            PaymentEventPublisher eventPublisher) {
        this.paymentRepository = paymentRepository;
        this.gatewayFactory = gatewayFactory;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Process a gateway callback (IPN).
     * 1. Verifies the signature.
     * 2. Finds the transaction by gateway transaction ID, or by idempotency key as fallback.
     *    (MoMo callbacks send requestId as transactionId, not the UUID from initiate.)
     * 3. Advances the transaction state machine.
     * 4. Publishes the corresponding payment event to RabbitMQ.
     */
    @Transactional
    public void execute(PaymentGatewayType gatewayType, Map<String, String> params) {
        log.info("Processing callback: gateway={}", gatewayType);

        var gateway = gatewayFactory.get(gatewayType);
        if (gateway == null) {
            throw new com.uit.paymentservice.application.exception.UnsupportedGatewayException(
                "Unsupported gateway: " + gatewayType);
        }

        GatewayCallbackResult result = gateway.processCallback(params);

        if (!result.verifiedSignature()) {
            log.warn("Callback signature verification failed: gateway={}", gatewayType);
            throw new InvalidSignatureException("Signature verification failed");
        }

        // Look up transaction — first by gatewayTxId, then by idempotency key (fallback for MoMo)
        PaymentTransaction tx = resolveTransaction(result.gatewayTransactionId(), params);

        if (tx == null) {
            log.warn("No payment transaction found for gatewayTxId={}", result.gatewayTransactionId());
            throw new PaymentNotFoundException("Transaction not found: " + result.gatewayTransactionId());
        }

        if (result.success()) {
            try {
                tx.markSuccess(result.gatewayTransactionId(), result.rawParams().toString());
                paymentRepository.save(tx);

                eventPublisher.publish(new PaymentSucceededEvent(
                    tx.getIdempotencyKey(),
                    tx.getOrderId(),
                    tx.getUserId(),
                    tx.getGatewayType(),
                    tx.getAmount(),
                    tx.getCurrency(),
                    result.gatewayTransactionId()
                ));

                log.info("Payment succeeded: transactionId={}, gatewayTxId={}", tx.getId(), result.gatewayTransactionId());
            } catch (IllegalStateException e) {
                log.warn("Invalid state transition on callback: {}", e.getMessage());
                throw new InvalidPaymentStateException(e.getMessage());
            }
        } else {
            try {
                tx.markFailed("Gateway reported failure: " + result.status());
                paymentRepository.save(tx);

                eventPublisher.publish(new PaymentFailedEvent(
                    tx.getIdempotencyKey(),
                    tx.getOrderId(),
                    tx.getUserId(),
                    tx.getGatewayType(),
                    "Gateway reported failure: " + result.status()
                ));

                log.info("Payment failed: transactionId={}, reason={}", tx.getId(), result.status());
            } catch (IllegalStateException e) {
                log.warn("Invalid state transition on callback: {}", e.getMessage());
                throw new InvalidPaymentStateException(e.getMessage());
            }
        }
    }

    /**
     * Resolves the transaction: tries gatewayTransactionId first, then falls back to
     * idempotency key extracted from callback params (MoMo uses requestId).
     */
    private PaymentTransaction resolveTransaction(String gatewayTxId, Map<String, String> params) {
        // Try gateway transaction ID first
        if (gatewayTxId != null && !gatewayTxId.isBlank()) {
            Optional<PaymentTransaction> byGatewayTx =
                paymentRepository.findByGatewayTransactionId(gatewayTxId);
            if (byGatewayTx.isPresent()) {
                log.debug("Transaction found by gatewayTxId={}", gatewayTxId);
                return byGatewayTx.get();
            }
        }

        // Fallback: try idempotency key from callback params
        // MoMo uses "requestId", others may use different keys
        String idempotencyKey = resolveIdempotencyKey(params);
        if (idempotencyKey != null) {
            Optional<PaymentTransaction> byKey =
                paymentRepository.findByIdempotencyKey(idempotencyKey);
            if (byKey.isPresent()) {
                log.debug("Transaction found by idempotencyKey={} (fallback lookup)", idempotencyKey);
                return byKey.get();
            }
        }

        return null;
    }

    /**
     * Extract idempotency key from callback params.
     * Different gateways use different field names.
     */
    private String resolveIdempotencyKey(Map<String, String> params) {
        // MoMo: requestId = idempotency key
        if (params.containsKey("requestId")) return params.get("requestId");
        // VNPay: vnp_TxnRef = idempotency key
        if (params.containsKey("vnp_TxnRef")) return params.get("vnp_TxnRef");
        // Generic fallback
        if (params.containsKey("idempotencyKey")) return params.get("idempotencyKey");
        return null;
    }
}
