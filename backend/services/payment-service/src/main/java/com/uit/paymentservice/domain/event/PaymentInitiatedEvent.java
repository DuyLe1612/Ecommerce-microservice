package com.uit.paymentservice.domain.event;

import com.uit.paymentservice.domain.model.PaymentGatewayType;
import java.math.BigDecimal;

public final class PaymentInitiatedEvent extends PaymentEvent {
    public final PaymentGatewayType gatewayType;
    public final BigDecimal amount;
    public final String currency;

    public PaymentInitiatedEvent(String transactionId, Long orderId, String userId,
                                 PaymentGatewayType gatewayType, BigDecimal amount, String currency) {
        super(transactionId, orderId, userId);
        this.gatewayType = gatewayType;
        this.amount = amount;
        this.currency = currency;
    }
}
