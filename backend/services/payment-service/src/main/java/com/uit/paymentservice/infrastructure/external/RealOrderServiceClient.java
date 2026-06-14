package com.uit.paymentservice.infrastructure.external;

import com.uit.paymentservice.infrastructure.config.ExternalServiceConfig;
import java.math.BigDecimal;
import java.time.Duration;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@ConditionalOnProperty(name = "payment.external.order.mode", havingValue = "real")
public class RealOrderServiceClient implements OrderServiceClient {

    private static final Logger log = LoggerFactory.getLogger(RealOrderServiceClient.class);
    private final WebClient webClient;
    private final ExternalServiceConfig config;

    public RealOrderServiceClient(WebClient.Builder webClientBuilder, ExternalServiceConfig config) {
        this.config = config;
        this.webClient = webClientBuilder
            .baseUrl(config.order().baseUrl())
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .build();
    }

    @Override
    public OrderValidationResult validateOrderForPayment(Long orderId, Long userId, BigDecimal requestedAmount) {
        try {
            log.debug("Calling order-service to validate order: orderId={}, userId={}", orderId, userId);

            Map<String, Object> response = webClient.get()
                .uri(uriBuilder -> uriBuilder
                    .path("/api/orders/{orderId}/validate")
                    .queryParam("userId", userId)
                    .queryParam("amount", requestedAmount)
                    .build(orderId))
                .retrieve()
                .bodyToMono(Map.class)
                .block(Duration.ofSeconds(5));

            boolean exists = Boolean.TRUE.equals(response.get("exists"));
            Long orderUserId = Long.valueOf(response.get("userId").toString());
            BigDecimal expectedAmount = new BigDecimal(response.get("expectedAmount").toString());
            String currency = (String) response.get("currency");
            String status = (String) response.get("status");

            log.debug("Order validation success: exists={}, userId={}, amount={}", exists, orderUserId, expectedAmount);
            return new OrderValidationResult(exists, orderUserId, expectedAmount, currency, status);
        } catch (Exception ex) {
            log.error("Order service unavailable: {}", ex.getMessage());
            throw new OrderServiceUnavailableException("Order service unavailable: " + ex.getMessage());
        }
    }

    public static class OrderServiceUnavailableException extends RuntimeException {
        public OrderServiceUnavailableException(String message) {
            super(message);
        }
    }
}
