package com.uit.orderservice.domain.event;

public non-sealed class OrderCancelledEvent extends OrderEvent {
    public final String reason;

    public OrderCancelledEvent(Long orderId, String orderNumber, Long userId, String reason) {
        super(orderId, orderNumber, userId);
        this.reason = reason;
    }
}
