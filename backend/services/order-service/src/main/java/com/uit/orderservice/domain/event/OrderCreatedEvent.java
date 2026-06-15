package com.uit.orderservice.domain.event;

import java.math.BigDecimal;

public non-sealed class OrderCreatedEvent extends OrderEvent {

    public final BigDecimal totalAmount;
    public final String currency;
    public final String couponCode;

    public OrderCreatedEvent(Long orderId, String orderNumber, Long userId,
                             BigDecimal totalAmount, String currency, String couponCode) {
        super(orderId, orderNumber, userId);
        this.totalAmount = totalAmount;
        this.currency = currency;
        this.couponCode = couponCode;
    }
}
