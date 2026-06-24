package com.uit.paymentservice.domain.event;

import com.uit.paymentservice.domain.model.PaymentGatewayType;
import java.math.BigDecimal;

public final class PaymentSucceededEvent extends PaymentEvent {
    public final PaymentGatewayType gatewayType;
    public final BigDecimal amount;
    public final String currency;
    public final String gatewayTransactionId;

    public PaymentSucceededEvent(String transactionId, Long orderId, String userId,
                                 PaymentGatewayType gatewayType, BigDecimal amount,
                                 String currency, String gatewayTransactionId) {
        super(transactionId, orderId, userId);
        this.gatewayType = gatewayType;
        this.amount = amount;
        this.currency = currency;
        this.gatewayTransactionId = gatewayTransactionId;
    }
}
