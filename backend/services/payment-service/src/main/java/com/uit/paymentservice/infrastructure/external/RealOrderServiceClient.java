package com.uit.paymentservice.infrastructure.external;

import com.uit.paymentservice.infrastructure.config.ExternalServiceConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.util.Map;

@Component
public class RealOrderServiceClient implements OrderServiceClient {

    private static final Logger log =
            LoggerFactory.getLogger(RealOrderServiceClient.class);

    private final RestClient restClient;

    public RealOrderServiceClient(
            RestClient.Builder restClientBuilder,
            ExternalServiceConfig config) {

        this.restClient = restClientBuilder
                .baseUrl(config.order().baseUrl())
                .build();
    }

    @Override
    public OrderValidationResult validateOrderForPayment(
            Long orderId,
            String userId,
            BigDecimal requestedAmount) {

        try {

            log.debug(
                    "Validating order: orderId={}, userId={}, amount={}",
                    orderId,
                    userId,
                    requestedAmount
            );

            Map body =
                    restClient.get()
                            .uri(uriBuilder -> uriBuilder
                                    .path("/api/orders/{orderId}/validate")
                                    .queryParam("userId", userId)
                                    .queryParam("amount", requestedAmount)
                                    .build(orderId))
                            .retrieve()
                            .body(Map.class);

            if (body == null || !Boolean.TRUE.equals(body.get("exists"))) {
                return new OrderValidationResult(false, userId, requestedAmount, "VND", "NOT_FOUND");
            }

            String orderUserId = String.valueOf(body.get("userId"));
            BigDecimal expected = new BigDecimal(body.get("expectedAmount").toString());
            String currency     = String.valueOf(body.getOrDefault("currency", "VND"));
            String status       = String.valueOf(body.getOrDefault("status", "PENDING_PAYMENT"));

            log.debug("Order validation result: orderId={}, ownershipValid={}, status={}",
                orderId, body.get("ownershipValid"), status);

            return new OrderValidationResult(true, orderUserId, expected, currency, status);

        } catch (RestClientException ex) {

            log.error(
                    "Order service unavailable. orderId={}",
                    orderId,
                    ex
            );

            throw new OrderServiceUnavailableException(
                    "Order service unavailable"
            );
        }
    }

    public static class OrderServiceUnavailableException
            extends RuntimeException {

        public OrderServiceUnavailableException(String message) {
            super(message);
        }
    }
}