package com.uit.paymentservice.domain.event;

import com.uit.paymentservice.domain.model.PaymentGatewayType;

public final class PaymentFailedEvent extends PaymentEvent {
    public final PaymentGatewayType gatewayType;
    public final String reason;

    public PaymentFailedEvent(String transactionId, Long orderId, Long userId,
                             PaymentGatewayType gatewayType, String reason) {
        super(transactionId, orderId, userId);
        this.gatewayType = gatewayType;
        this.reason = reason;
    }
}
