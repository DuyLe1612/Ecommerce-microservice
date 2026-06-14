package com.uit.paymentservice.infrastructure.external;

import java.math.BigDecimal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "payment.external.order.mode", havingValue = "mock", matchIfMissing = true)
public class MockOrderServiceClient implements OrderServiceClient {

    private static final Logger log = LoggerFactory.getLogger(MockOrderServiceClient.class);

    @Override
    public OrderValidationResult validateOrderForPayment(Long orderId, Long userId, BigDecimal requestedAmount) {
        // Mock always returns a valid order matching the requested amount.
        // This lets the payment flow proceed without a real order-service.
        // In real mode, the order-service validates the amount server-side.
        log.debug("Mock order validation: orderId={}, userId={}, amount={}", orderId, userId, requestedAmount);

        return new OrderValidationResult(
            true,           // exists
            userId,         // order belongs to this user
            requestedAmount, // amount matches client request
            "VND",
            "PENDING"
        );
    }
}
