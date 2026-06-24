package com.uit.orderservice.domain.event;

public non-sealed class OrderDeliveredEvent extends OrderEvent {
    public final String recipientSignature;

    public OrderDeliveredEvent(Long orderId, String orderNumber, String userId, String recipientSignature) {
        super(orderId, orderNumber, userId);
        this.recipientSignature = recipientSignature;
    }
}
