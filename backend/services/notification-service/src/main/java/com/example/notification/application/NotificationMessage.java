package com.example.notification.application;

public record NotificationMessage(
    String messageId,
    String eventType,
    String recipient,
    String subject,
    String body
) {}
