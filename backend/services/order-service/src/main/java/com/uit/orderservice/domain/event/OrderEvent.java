package com.uit.orderservice.domain.event;

import java.time.LocalDateTime;

public abstract sealed class OrderEvent permits
        OrderCreatedEvent, OrderCancelledEvent, OrderShippedEvent,
        OrderDeliveredEvent, OrderCompletedEvent {

    public final Long orderId;
    public final String orderNumber;
    public final Long userId;
    public final LocalDateTime occurredAt;

    protected OrderEvent(Long orderId, String orderNumber, Long userId) {
        this.orderId = orderId;
        this.orderNumber = orderNumber;
        this.userId = userId;
        this.occurredAt = LocalDateTime.now();
    }
}
