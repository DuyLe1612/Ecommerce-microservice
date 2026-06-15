package com.uit.orderservice.infrastructure.messaging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class OrderEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(OrderEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    public OrderEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publish(Object event) {
        try {
            String routingKey = resolveRoutingKey(event);
            rabbitTemplate.convertAndSend(RabbitMQConfig.ORDER_EVENTS_EXCHANGE, routingKey, event);
            log.info("Published event: {} with key: {}", event.getClass().getSimpleName(), routingKey);
        } catch (Exception ex) {
            log.error("Failed to publish event {}: {}", event.getClass().getSimpleName(), ex.getMessage(), ex);
        }
    }

    private String resolveRoutingKey(Object event) {
        String name = event.getClass().getSimpleName();
        return switch (name) {
            case "OrderCreatedEvent" -> RabbitMQConfig.ORDER_CREATED_KEY;
            case "OrderCancelledEvent" -> RabbitMQConfig.ORDER_CANCELLED_KEY;
            case "OrderShippedEvent" -> RabbitMQConfig.ORDER_SHIPPED_KEY;
            case "OrderDeliveredEvent" -> RabbitMQConfig.ORDER_DELIVERED_KEY;
            case "OrderCompletedEvent" -> RabbitMQConfig.ORDER_COMPLETED_KEY;
            default -> "order.unknown";
        };
    }
}
