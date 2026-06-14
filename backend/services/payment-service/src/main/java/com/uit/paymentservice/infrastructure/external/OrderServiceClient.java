package com.uit.paymentservice.infrastructure.external;

import java.math.BigDecimal;

public interface OrderServiceClient {

    record OrderValidationResult(
        boolean exists,
        Long userId,
        BigDecimal expectedAmount,
        String currency,
        String status
    ) {}

    OrderValidationResult validateOrderForPayment(Long orderId, Long userId, BigDecimal requestedAmount);
}
