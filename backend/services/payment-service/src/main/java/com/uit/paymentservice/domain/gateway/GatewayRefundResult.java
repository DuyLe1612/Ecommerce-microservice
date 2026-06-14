package com.uit.paymentservice.domain.gateway;

import com.uit.paymentservice.domain.model.Money;

public record GatewayRefundResult(
    String refundId,
    boolean success,
    Money refundedAmount,
    String errorMessage
) {}
