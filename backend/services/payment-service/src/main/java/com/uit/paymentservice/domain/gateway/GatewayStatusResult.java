package com.uit.paymentservice.domain.gateway;

public record GatewayStatusResult(
    String gatewayTransactionId,
    String status,
    String rawResponse,
    boolean success
) {}
