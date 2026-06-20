package com.example.notification.infrastructure.email;

import com.example.notification.application.NotificationMessage;
import com.example.notification.application.NotificationSender;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class LoggingNotificationSender implements NotificationSender {
    @Override
    public void send(NotificationMessage message) {
        log.info("Notification logged: type={} messageId={} recipient={} subject={}",
            message.eventType(), message.messageId(), message.recipient(), message.subject());
    }
}
