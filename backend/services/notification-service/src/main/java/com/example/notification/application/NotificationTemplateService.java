package com.example.notification.application;

import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class NotificationTemplateService {
    public NotificationMessage render(String messageId, String eventType, Map<String, Object> payload) {
        String recipient = resolveRecipient(payload);
        String subject = switch (eventType) {
            case "UserRegistered" -> "Welcome to Tekno";
            case "PaymentSuccess" -> "Payment received";
            case "PaymentFailed" -> "Payment failed";
            case "OrderShipped" -> "Your order has shipped";
            case "OrderDelivered" -> "Your order was delivered";
            case "OrderCancelled" -> "Your order was cancelled";
            case "ReviewApproved" -> "Your review was approved";
            default -> "Tekno notification";
        };
        String body = subject + "\n\n" + payload;
        return new NotificationMessage(messageId, eventType, recipient, subject, body);
    }

    private String resolveRecipient(Map<String, Object> payload) {
        Object email = payload.get("email");
        if (email == null) {
            email = payload.get("userEmail");
        }
        if (email == null && payload.get("userId") != null) {
            email = "user-" + payload.get("userId") + "@tekno.local";
        }
        return email == null ? "unknown@tekno.local" : String.valueOf(email);
    }
}
