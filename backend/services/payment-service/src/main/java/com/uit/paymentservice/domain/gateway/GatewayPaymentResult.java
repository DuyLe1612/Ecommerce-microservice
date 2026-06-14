package com.uit.paymentservice.domain.gateway;

public record GatewayPaymentResult(
    String gatewayTransactionId,
    String redirectUrl,
    String rawResponse,
    boolean success,
    String errorMessage
) {}
