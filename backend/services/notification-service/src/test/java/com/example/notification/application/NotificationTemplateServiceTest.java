package com.example.notification.application;

import java.util.Map;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class NotificationTemplateServiceTest {
    @Test
    void rendersKnownPaymentSuccessTemplate() {
        NotificationTemplateService service = new NotificationTemplateService();

        NotificationMessage message = service.render("msg-1", "PaymentSuccess", Map.of(
            "email", "customer@example.com",
            "orderId", 123
        ));

        assertEquals("msg-1", message.messageId());
        assertEquals("Payment received", message.subject());
        assertEquals("customer@example.com", message.recipient());
        assertTrue(message.body().contains("orderId=123"));
    }
}
