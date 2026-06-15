package com.uit.orderservice.domain.event;

public non-sealed class OrderCompletedEvent extends OrderEvent {
    public OrderCompletedEvent(Long orderId, String orderNumber, Long userId) {
        super(orderId, orderNumber, userId);
    }
}
