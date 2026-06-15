package com.uit.paymentservice.presentation.rest;

import com.uit.paymentservice.application.command.HandleCallbackCommand;
import com.uit.paymentservice.domain.model.PaymentGatewayType;
import com.uit.paymentservice.domain.model.PaymentTransaction;
import com.uit.paymentservice.domain.repository.PaymentRepository;
import com.uit.paymentservice.domain.gateway.PaymentGateway;
import com.uit.paymentservice.infrastructure.gateway.PaymentGatewayFactory;
import com.uit.paymentservice.infrastructure.messaging.PaymentEventPublisher;
import com.uit.paymentservice.domain.event.PaymentSucceededEvent;
import com.uit.paymentservice.domain.event.PaymentFailedEvent;
import com.uit.paymentservice.application.exception.InvalidPaymentStateException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Internal callback endpoints — called by internal simulators or other services.
 * NO signature verification (trusted internal callers only).
 *
 * This controller bypasses the standard gateway signature verification because
 * internal callers (simulators, other microservices) are trusted.
 */
@RestController
@RequestMapping("/internal/callback")
@Tag(name = "Internal — Callbacks", description = "Internal callback handlers without signature verification")
public class InternalCallbackController {

    private static final Logger log = LoggerFactory.getLogger(InternalCallbackController.class);

    private final PaymentRepository paymentRepository;
    private final PaymentGatewayFactory gatewayFactory;
    private final PaymentEventPublisher eventPublisher;

    public InternalCallbackController(
            PaymentRepository paymentRepository,
            PaymentGatewayFactory gatewayFactory,
            PaymentEventPublisher eventPublisher) {
        this.paymentRepository = paymentRepository;
        this.gatewayFactory = gatewayFactory;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Trigger a simulated payment success callback.
     * Called by simulators or test tools to advance the payment state machine.
     *
     * @param idempotencyKey The payment's idempotency key (required to find the transaction)
     * @param gatewayType    The gateway that "received" the callback
     * @param gatewayTxId    The gateway's own transaction ID (optional — auto-generated if null)
     * @return 200 on success, 404 if transaction not found, 409 on invalid state
     */
    @Operation(
        summary = "Simulate a successful payment callback",
        description = "Called by simulators/internal services to advance the payment to SUCCESS state. " +
            "Looks up the transaction by idempotency key and updates its status."
    )
    @PostMapping("/success")
    public ResponseEntity<Map<String, Object>> simulateSuccess(
            @Parameter(description = "Payment idempotency key (UUID)", required = true, example = "550e8400-e29b-41d4-a716-446655440000")
            @RequestParam("idempotencyKey") String idempotencyKey,
            @Parameter(description = "Gateway type", example = "MOMO")
            @RequestParam("gatewayType") PaymentGatewayType gatewayType,
            @Parameter(description = "Gateway's own transaction ID (auto-generated if omitted)")
            @RequestParam(value = "gatewayTxId", required = false) String gatewayTxId) {

        return processCallback(idempotencyKey, gatewayType, gatewayTxId, true, null);
    }

    /**
     * Trigger a simulated payment failure callback.
     */
    @Operation(summary = "Simulate a failed payment callback")
    @PostMapping("/failure")
    public ResponseEntity<Map<String, Object>> simulateFailure(
            @Parameter(description = "Payment idempotency key (UUID)", required = true)
            @RequestParam("idempotencyKey") String idempotencyKey,
            @Parameter(description = "Gateway type", example = "MOMO")
            @RequestParam("gatewayType") PaymentGatewayType gatewayType,
            @Parameter(description = "Failure reason")
            @RequestParam(value = "reason", required = false) String reason) {

        return processCallback(idempotencyKey, gatewayType, null, false, reason);
    }

    /**
     * Core callback processing — handles both success and failure.
     * Transaction is looked up by idempotency key (not gatewayTxId),
     * then the gateway's processCallback result is applied.
     */
    private ResponseEntity<Map<String, Object>> processCallback(
            String idempotencyKey,
            PaymentGatewayType gatewayType,
            String providedGatewayTxId,
            boolean success,
            String failureReason) {

        PaymentTransaction tx = paymentRepository.findByIdempotencyKey(idempotencyKey)
            .orElse(null);

        if (tx == null) {
            log.warn("No transaction found for idempotencyKey={}", idempotencyKey);
            return ResponseEntity.status(404)
                .body(Map.of("error", "TRANSACTION_NOT_FOUND", "idempotencyKey", idempotencyKey));
        }

        // Get gateway to produce the callback result
        PaymentGateway gateway = gatewayFactory.get(gatewayType);
        if (gateway == null) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "UNSUPPORTED_GATEWAY", "gateway", gatewayType.name()));
        }

        // Build callback params matching what the gateway expects
        Map<String, String> params = buildCallbackParams(tx, gatewayType, providedGatewayTxId, success, failureReason);

        var callbackResult = gateway.processCallback(params);

        // Override with our internal result (ignore signature verification in simulator)
        boolean finalSuccess = success;

        try {
            if (finalSuccess) {
                String gatewayTxIdToSave = providedGatewayTxId != null
                    ? providedGatewayTxId
                    : tx.getGatewayTransactionId(); // keep existing if not provided
                tx.markSuccess(gatewayTxIdToSave, callbackResult.rawParams().toString());
                paymentRepository.save(tx);

                eventPublisher.publish(new PaymentSucceededEvent(
                    tx.getIdempotencyKey(),
                    tx.getOrderId(),
                    tx.getUserId(),
                    tx.getGatewayType(),
                    tx.getAmount(),
                    tx.getCurrency(),
                    gatewayTxIdToSave
                ));

                log.info("Payment succeeded (internal callback): transactionId={}, idempotencyKey={}, gatewayTxId={}",
                    tx.getId(), idempotencyKey, gatewayTxIdToSave);

                return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "transactionId", tx.getId(),
                    "idempotencyKey", idempotencyKey,
                    "gatewayTxId", gatewayTxIdToSave
                ));
            } else {
                String reason = failureReason != null ? failureReason : "Simulated failure";
                tx.markFailed(reason);
                paymentRepository.save(tx);

                eventPublisher.publish(new PaymentFailedEvent(
                    tx.getIdempotencyKey(),
                    tx.getOrderId(),
                    tx.getUserId(),
                    tx.getGatewayType(),
                    reason
                ));

                log.info("Payment failed (internal callback): transactionId={}, idempotencyKey={}, reason={}",
                    tx.getId(), idempotencyKey, reason);

                return ResponseEntity.ok(Map.of(
                    "status", "FAILED",
                    "transactionId", tx.getId(),
                    "idempotencyKey", idempotencyKey,
                    "reason", reason
                ));
            }
        } catch (IllegalStateException e) {
            log.warn("Invalid state transition: transactionId={}, currentStatus={}",
                tx.getId(), tx.getStatus());
            return ResponseEntity.status(409)
                .body(Map.of("error", "INVALID_STATE_TRANSITION",
                    "currentStatus", tx.getStatus().name(),
                    "message", e.getMessage()));
        }
    }

    /**
     * Builds gateway-specific callback parameters.
     * These mimic what the real gateway would send back.
     */
    private Map<String, String> buildCallbackParams(
            PaymentTransaction tx,
            PaymentGatewayType gatewayType,
            String gatewayTxId,
            boolean success,
            String failureReason) {

        String resultCode = success ? getSuccessCode(gatewayType) : getFailureCode(gatewayType);
        String status = success ? "SUCCESS" : "FAILED";
        String reason = success ? "Success" : (failureReason != null ? failureReason : "Simulated failure");

        return switch (gatewayType) {
            case MOMO -> Map.of(
                "requestId", tx.getIdempotencyKey(),
                "orderId", String.valueOf(tx.getOrderId()),
                "resultCode", resultCode,
                "amount", String.valueOf(tx.getAmount()),
                "transId", gatewayTxId != null ? gatewayTxId : "MOCK_TXN",
                "message", reason
            );
            case VNPAY -> {
                Map<String, String> base = new java.util.LinkedHashMap<>();
                base.put("vnp_TxnRef", tx.getIdempotencyKey());
                base.put("vnp_Amount", tx.getAmount().multiply(java.math.BigDecimal.valueOf(100)).toBigInteger().toString());
                base.put("vnp_ResponseCode", resultCode);
                base.put("vnp_TransactionNo", gatewayTxId != null ? gatewayTxId : "MOCK_TXN");
                base.put("vnp_PayDate", java.time.LocalDateTime.now().format(
                    java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
                base.put("vnp_BankCode", "NCB");
                yield base;
            }
            case ZALOPAY, PAYPAL, STRIPE -> Map.of(
                "requestId", tx.getIdempotencyKey(),
                "orderId", String.valueOf(tx.getOrderId()),
                "status", status,
                "amount", String.valueOf(tx.getAmount()),
                "gatewayTransactionId", gatewayTxId != null ? gatewayTxId : "MOCK_TXN"
            );
        };
    }

    private String getSuccessCode(PaymentGatewayType type) {
        return switch (type) {
            case MOMO -> "0";
            case VNPAY -> "00";
            default -> "SUCCESS";
        };
    }

    private String getFailureCode(PaymentGatewayType type) {
        return switch (type) {
            case MOMO -> "99";
            case VNPAY -> "99";
            default -> "FAILED";
        };
    }
}
