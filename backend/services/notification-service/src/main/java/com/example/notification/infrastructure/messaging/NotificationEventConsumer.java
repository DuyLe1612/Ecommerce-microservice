package com.example.notification.infrastructure.messaging;

import com.example.notification.application.NotificationProcessingService;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationEventConsumer {
    private final NotificationProcessingService processingService;

    @RabbitListener(queues = RabbitMQConfig.USER_REGISTERED_QUEUE)
    public void userRegistered(Map<String, Object> payload, Message message) {
        process("UserRegistered", payload, message);
    }

    @RabbitListener(queues = RabbitMQConfig.PAYMENT_SUCCESS_QUEUE)
    public void paymentSuccess(Map<String, Object> payload, Message message) {
        process("PaymentSuccess", payload, message);
    }

    @RabbitListener(queues = RabbitMQConfig.PAYMENT_FAILED_QUEUE)
    public void paymentFailed(Map<String, Object> payload, Message message) {
        process("PaymentFailed", payload, message);
    }

    @RabbitListener(queues = RabbitMQConfig.ORDER_SHIPPED_QUEUE)
    public void orderShipped(Map<String, Object> payload, Message message) {
        process("OrderShipped", payload, message);
    }

    @RabbitListener(queues = RabbitMQConfig.ORDER_DELIVERED_QUEUE)
    public void orderDelivered(Map<String, Object> payload, Message message) {
        process("OrderDelivered", payload, message);
    }

    @RabbitListener(queues = RabbitMQConfig.REVIEW_APPROVED_QUEUE)
    public void reviewApproved(Map<String, Object> payload, Message message) {
        process("ReviewApproved", payload, message);
    }

    private void process(String eventType, Map<String, Object> payload, Message message) {
        processingService.process(resolveMessageId(payload, message), eventType, payload);
    }

    private String resolveMessageId(Map<String, Object> payload, Message message) {
        Object eventId = payload.get("eventId");
        if (eventId == null) {
            eventId = payload.get("idempotencyKey");
        }
        if (eventId != null) {
            return String.valueOf(eventId);
        }
        String messageId = message.getMessageProperties().getMessageId();
        return messageId == null ? UUID.randomUUID().toString() : messageId;
    }
}
