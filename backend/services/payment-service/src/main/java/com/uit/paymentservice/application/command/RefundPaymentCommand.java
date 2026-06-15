package com.uit.paymentservice.application.command;

import com.uit.paymentservice.domain.model.PaymentTransaction;
import com.uit.paymentservice.domain.model.PaymentStatus;
import com.uit.paymentservice.domain.repository.PaymentRepository;
import com.uit.paymentservice.infrastructure.gateway.PaymentGatewayFactory;
import com.uit.paymentservice.infrastructure.messaging.PaymentEventPublisher;
import com.uit.paymentservice.domain.event.PaymentRefundedEvent;
import com.uit.paymentservice.application.exception.PaymentNotFoundException;
import com.uit.paymentservice.application.exception.InvalidPaymentStateException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

@Service
public class RefundPaymentCommand {

    private static final Logger log = LoggerFactory.getLogger(RefundPaymentCommand.class);

    private final PaymentRepository paymentRepository;
    private final PaymentGatewayFactory gatewayFactory;
    private final PaymentEventPublisher eventPublisher;

    public RefundPaymentCommand(
            PaymentRepository paymentRepository,
            PaymentGatewayFactory gatewayFactory,
            PaymentEventPublisher eventPublisher) {
        this.paymentRepository = paymentRepository;
        this.gatewayFactory = gatewayFactory;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public void execute(Long transactionId, BigDecimal refundAmount, String reason) {
        log.info("Processing refund: transactionId={}, amount={}, reason={}", transactionId, refundAmount, reason);

        PaymentTransaction tx = paymentRepository.findById(transactionId)
            .orElseThrow(() -> new PaymentNotFoundException("Transaction not found: " + transactionId));

        if (tx.getStatus() != PaymentStatus.SUCCESS) {
            throw new InvalidPaymentStateException(
                "Can only refund SUCCESS payments, current status: " + tx.getStatus());
        }

        if (refundAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Refund amount must be positive");
        }

        if (refundAmount.compareTo(tx.getAmount()) > 0) {
            throw new IllegalArgumentException(
                "Refund amount " + refundAmount + " exceeds original payment " + tx.getAmount());
        }

        var gateway = gatewayFactory.get(tx.getGatewayType());
        var refundResult = gateway.refund(tx.getGatewayTransactionId(),
            new com.uit.paymentservice.domain.model.Money(refundAmount, tx.getCurrency()));

        if (!refundResult.success()) {
            throw new RuntimeException("Gateway refund failed: " + refundResult.errorMessage());
        }

        tx.markRefunded();
        paymentRepository.save(tx);

        eventPublisher.publish(new PaymentRefundedEvent(
            tx.getIdempotencyKey(),
            tx.getOrderId(),
            tx.getUserId(),
            tx.getGatewayType(),
            refundAmount,
            tx.getCurrency()
        ));

        log.info("Refund completed: transactionId={}, refundId={}", transactionId, refundResult.refundId());
    }
}
