package com.uit.paymentservice.domain.event;

import com.uit.paymentservice.domain.model.PaymentGatewayType;

public final class PaymentTimedOutEvent extends PaymentEvent {
    public final PaymentGatewayType gatewayType;

    public PaymentTimedOutEvent(String transactionId, Long orderId, Long userId,
                                 PaymentGatewayType gatewayType) {
        super(transactionId, orderId, userId);
        this.gatewayType = gatewayType;
    }
}
