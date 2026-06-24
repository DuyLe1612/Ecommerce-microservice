package com.uit.orderservice.domain.event;

public non-sealed class OrderShippedEvent extends OrderEvent {
    public final String trackingNumber;

    public OrderShippedEvent(Long orderId, String orderNumber, String userId, String trackingNumber) {
        super(orderId, orderNumber, userId);
        this.trackingNumber = trackingNumber;
    }
}
