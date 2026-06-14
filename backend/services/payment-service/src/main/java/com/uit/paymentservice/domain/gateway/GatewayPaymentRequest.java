package com.uit.paymentservice.domain.gateway;

import java.math.BigDecimal;
import java.util.Map;

public record GatewayPaymentRequest(
    String transactionId,
    Long orderId,
    Long userId,
    BigDecimal amount,
    String currency,
    String returnUrl,
    String description,
    Map<String, String> metadata
) {}
