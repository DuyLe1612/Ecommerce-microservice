package com.uit.paymentservice.domain.event;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public abstract sealed class PaymentEvent
    permits PaymentInitiatedEvent, PaymentSucceededEvent,
            PaymentFailedEvent, PaymentRefundedEvent, PaymentTimedOutEvent {
    public final String transactionId;
    public final Long orderId;
    public final String userId;
    public final LocalDateTime occurredAt;

    protected PaymentEvent(String transactionId, Long orderId, String userId) {
        this.transactionId = transactionId;
        this.orderId = orderId;
        this.userId = userId;
        this.occurredAt = LocalDateTime.now();
    }
}
