package com.uit.paymentservice.application.command;

import com.uit.paymentservice.domain.model.PaymentGatewayType;
import com.uit.paymentservice.domain.model.PaymentStatus;
import com.uit.paymentservice.domain.model.PaymentTransaction;
import com.uit.paymentservice.domain.repository.PaymentRepository;
import com.uit.paymentservice.infrastructure.external.OrderServiceClient;
import com.uit.paymentservice.infrastructure.gateway.PaymentGatewayFactory;
import com.uit.paymentservice.infrastructure.messaging.PaymentEventPublisher;
import com.uit.paymentservice.application.exception.OrderNotFoundException;
import com.uit.paymentservice.application.exception.PaymentAmountMismatchException;
import com.uit.paymentservice.application.exception.UnauthorizedOrderAccessException;
import com.uit.paymentservice.application.exception.DuplicatePaymentException;
import com.uit.paymentservice.application.exception.IdempotentResponseException;
import com.uit.paymentservice.application.dto.ProcessPaymentResponse;
import com.uit.paymentservice.domain.gateway.GatewayPaymentRequest;
import com.uit.paymentservice.domain.gateway.GatewayPaymentResult;
import com.uit.paymentservice.domain.event.PaymentInitiatedEvent;
import com.uit.paymentservice.domain.event.PaymentFailedEvent;
import com.uit.paymentservice.domain.model.Money;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProcessPaymentCommandHandler {

    private static final Logger log = LoggerFactory.getLogger(ProcessPaymentCommandHandler.class);

    private final PaymentRepository paymentRepository;
    private final PaymentGatewayFactory gatewayFactory;
    private final OrderServiceClient orderServiceClient;
    private final PaymentEventPublisher eventPublisher;

    public ProcessPaymentCommandHandler(
            PaymentRepository paymentRepository,
            PaymentGatewayFactory gatewayFactory,
            OrderServiceClient orderServiceClient,
            PaymentEventPublisher eventPublisher) {
        this.paymentRepository = paymentRepository;
        this.gatewayFactory = gatewayFactory;
        this.orderServiceClient = orderServiceClient;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public ProcessPaymentResponse execute(ProcessPaymentCommand command, Long userId, String idempotencyKey) {
        log.debug("Processing payment: orderId={}, amount={}, gateway={}, userId={}, idempotencyKey={}",
            command.orderId(), command.amount(), command.gatewayType(), userId, idempotencyKey);

        // 1. Validate idempotency
        Optional<PaymentTransaction> existing = paymentRepository.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) {
            PaymentTransaction tx = existing.get();
            if (tx.getStatus() != PaymentStatus.FAILED) {
                log.info("Returning idempotent response for key: {}", idempotencyKey);
                throw new IdempotentResponseException(tx);
            }
        }

        // 2. Validate order via OrderServiceClient
        OrderServiceClient.OrderValidationResult orderResult =
            orderServiceClient.validateOrderForPayment(command.orderId(), userId, command.amount());

        if (!orderResult.exists()) {
            throw new OrderNotFoundException("Order not found: " + command.orderId());
        }

        if (!orderResult.userId().equals(userId)) {
            throw new UnauthorizedOrderAccessException(
                "Order " + command.orderId() + " does not belong to user " + userId);
        }

        if (orderResult.expectedAmount().compareTo(command.amount()) != 0) {
            throw new PaymentAmountMismatchException(
                "Amount mismatch: requested " + command.amount() +
                " but order expects " + orderResult.expectedAmount());
        }

        // 3. Create PaymentTransaction
        LocalDateTime expiredAt = LocalDateTime.now().plusMinutes(15);
        PaymentTransaction tx = PaymentTransaction.create(
            command.orderId(),
            userId,
            command.amount(),
            command.currency(),
            command.gatewayType(),
            PaymentStatus.PROCESSING,
            idempotencyKey,
            expiredAt
        );

        // 4. Save to DB
        tx = paymentRepository.save(tx);
        log.debug("PaymentTransaction saved: id={}", tx.getId());

        // 5. Resolve gateway and initiate
        var gateway = gatewayFactory.get(command.gatewayType());
        if (gateway == null) {
            tx.markFailed("Unsupported gateway: " + command.gatewayType());
            paymentRepository.save(tx);
            throw new com.uit.paymentservice.application.exception.UnsupportedGatewayException(
                "Unsupported gateway: " + command.gatewayType());
        }

        GatewayPaymentRequest gatewayRequest = new GatewayPaymentRequest(
            idempotencyKey,
            command.orderId(),
            userId,
            command.amount(),
            command.currency(),
            command.returnUrl(),
            command.description(),
            Map.of()
        );

        GatewayPaymentResult result = gateway.initiate(gatewayRequest);

        // 6. Update transaction based on result
        if (result.success()) {
            tx.markProcessing(result.redirectUrl());
            tx.setGatewayTransactionId(result.gatewayTransactionId());
            tx.setGatewayRawResponse(result.rawResponse());
            paymentRepository.save(tx);

            eventPublisher.publish(new PaymentInitiatedEvent(
                idempotencyKey,
                command.orderId(),
                userId,
                command.gatewayType(),
                command.amount(),
                command.currency()
            ));

            log.info("Payment initiated successfully: transactionId={}, gatewayTxId={}",
                tx.getId(), result.gatewayTransactionId());

            return new ProcessPaymentResponse(
                tx.getId(),
                idempotencyKey,
                PaymentStatus.PROCESSING.name(),
                result.redirectUrl(),
                command.gatewayType().name(),
                tx.getExpiredAt()
            );
        } else {
            tx.markFailed(result.errorMessage());
            paymentRepository.save(tx);

            eventPublisher.publish(new PaymentFailedEvent(
                idempotencyKey,
                command.orderId(),
                userId,
                command.gatewayType(),
                result.errorMessage()
            ));

            log.warn("Payment initiation failed: transactionId={}, error={}", tx.getId(), result.errorMessage());
            throw new com.uit.paymentservice.application.exception.GatewaySimulationException(result.errorMessage());
        }
    }
}
