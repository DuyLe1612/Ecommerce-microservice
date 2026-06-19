package com.example.notification.infrastructure.email;

import com.example.notification.application.NotificationMessage;
import com.example.notification.application.NotificationSender;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "notification.email.enabled", havingValue = "true")
public class EmailNotificationSender implements NotificationSender {
    private final JavaMailSender mailSender;

    @Value("${notification.email.from:no-reply@tekno.local}")
    private String from;

    @Override
    public void send(NotificationMessage message) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setFrom(from);
        mail.setTo(message.recipient());
        mail.setSubject(message.subject());
        mail.setText(message.body());
        mailSender.send(mail);
        log.info("Email notification sent: messageId={} recipient={}", message.messageId(), message.recipient());
    }
}
