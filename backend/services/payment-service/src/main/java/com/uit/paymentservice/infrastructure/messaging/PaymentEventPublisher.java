package com.uit.paymentservice.infrastructure.messaging;

import com.uit.paymentservice.domain.event.PaymentEvent;
import com.uit.paymentservice.domain.event.PaymentFailedEvent;
import com.uit.paymentservice.domain.event.PaymentInitiatedEvent;
import com.uit.paymentservice.domain.event.PaymentRefundedEvent;
import com.uit.paymentservice.domain.event.PaymentSucceededEvent;
import com.uit.paymentservice.domain.event.PaymentTimedOutEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class PaymentEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(PaymentEventPublisher.class);
    private static final String EXCHANGE = "payment.events";

    private final RabbitTemplate rabbitTemplate;

    public PaymentEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publish(PaymentEvent event) {
        try {
            String routingKey = resolveRoutingKey(event);
            rabbitTemplate.convertAndSend(EXCHANGE, routingKey, event);
            log.info("Published event: {} with key: {}", event.getClass().getSimpleName(), routingKey);
        } catch (Exception ex) {
            log.warn("Failed to publish event {}: {}", event.getClass().getSimpleName(), ex.getMessage());
        }
    }

    private String resolveRoutingKey(PaymentEvent event) {
        if (event instanceof PaymentInitiatedEvent) return "payment.initiated";
        if (event instanceof PaymentSucceededEvent) return "payment.succeeded";
        if (event instanceof PaymentFailedEvent) return "payment.failed";
        if (event instanceof PaymentRefundedEvent) return "payment.refunded";
        if (event instanceof PaymentTimedOutEvent) return "payment.timeout";
        return "payment.unknown";
    }
}
