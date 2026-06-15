package com.uit.paymentservice.application.command;

import com.uit.paymentservice.domain.model.PaymentTransaction;
import com.uit.paymentservice.domain.repository.PaymentRepository;
import com.uit.paymentservice.infrastructure.messaging.PaymentEventPublisher;
import com.uit.paymentservice.domain.event.PaymentTimedOutEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CheckPaymentTimeoutsCommand {

    private static final Logger log = LoggerFactory.getLogger(CheckPaymentTimeoutsCommand.class);

    private final PaymentRepository paymentRepository;
    private final PaymentEventPublisher eventPublisher;

    public CheckPaymentTimeoutsCommand(
            PaymentRepository paymentRepository,
            PaymentEventPublisher eventPublisher) {
        this.paymentRepository = paymentRepository;
        this.eventPublisher = eventPublisher;
    }

    @Scheduled(fixedRateString = "${payment.timeout.sweep-interval-ms:60000}")
    public void sweepTimeouts() {
        execute();
    }

    @Transactional
    public void execute() {
        LocalDateTime cutoff = LocalDateTime.now();
        List<PaymentTransaction> expired = paymentRepository
            .findProcessingExpiredBefore(cutoff);

        if (expired.isEmpty()) {
            return;
        }

        for (PaymentTransaction tx : expired) {
            try {
                tx.markTimedOut();
                paymentRepository.save(tx);

                eventPublisher.publish(new PaymentTimedOutEvent(
                    tx.getIdempotencyKey(),
                    tx.getOrderId(),
                    tx.getUserId(),
                    tx.getGatewayType()
                ));

                log.info("Payment timed out: transactionId={}, orderId={}", tx.getId(), tx.getOrderId());
            } catch (IllegalStateException e) {
                log.warn("Could not timeout transaction {}: {}", tx.getId(), e.getMessage());
            }
        }

        log.info("Timeout sweep complete: {} transactions marked as TIMEOUT", expired.size());
    }
}
