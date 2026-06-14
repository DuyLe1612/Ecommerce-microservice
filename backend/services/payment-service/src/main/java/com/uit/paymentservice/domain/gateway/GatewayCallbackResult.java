package com.uit.paymentservice.domain.gateway;

import java.util.Map;

public record GatewayCallbackResult(
    boolean success,
    String gatewayTransactionId,
    String status,
    Map<String, String> rawParams,
    boolean verifiedSignature
) {}
