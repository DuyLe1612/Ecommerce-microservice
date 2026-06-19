package com.example.cart.infrastructure.product;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class ProductServiceClient implements ProductClient {
    private static final Duration TIMEOUT = Duration.ofSeconds(5);

    private final WebClient.Builder webClientBuilder;

    @Value("${services.product.url:http://product-service:8080}")
    private String productServiceUrl;

    @Override
    @SuppressWarnings("unchecked")
    public VariantInfo getVariant(Long variantId) {
        Map<String, Object> body = webClientBuilder.build()
            .get()
            .uri(productServiceUrl + "/api/products/variants/{variantId}", variantId)
            .retrieve()
            .onStatus(HttpStatusCode::isError, response ->
                Mono.error(new IllegalArgumentException("Variant not found: " + variantId)))
            .bodyToMono(Map.class)
            .timeout(TIMEOUT)
            .block();

        if (body == null || !Boolean.TRUE.equals(body.get("success"))) {
            throw new IllegalArgumentException("Variant not found: " + variantId);
        }

        Object data = body.get("data");
        if (!(data instanceof Map<?, ?> raw)) {
            throw new IllegalStateException("Invalid product-service variant response");
        }

        Long productId = numberAsLong(firstPresent(raw, "productId", "id"));
        BigDecimal price = numberAsBigDecimal(firstPresent(raw, "price", "basePrice"));
        String name = String.valueOf(valueOrDefault(raw.get("name"), "Variant " + variantId));
        String currency = String.valueOf(valueOrDefault(raw.get("currency"), "VND"));
        return new VariantInfo(variantId, productId == null ? variantId.intValue() : productId.intValue(), name, price, currency);
    }

    @Override
    public void ensureProductExists(Long productId) {
        Boolean exists = webClientBuilder.build()
            .get()
            .uri(productServiceUrl + "/internal/products/{productId}/exists", productId)
            .retrieve()
            .onStatus(HttpStatusCode::isError, response ->
                Mono.error(new IllegalArgumentException("Product not found: " + productId)))
            .bodyToMono(Boolean.class)
            .timeout(TIMEOUT)
            .block();
        if (!Boolean.TRUE.equals(exists)) {
            throw new IllegalArgumentException("Product not found: " + productId);
        }
    }

    private Long numberAsLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value == null) {
            return null;
        }
        return Long.parseLong(value.toString());
    }

    private BigDecimal numberAsBigDecimal(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        if (value instanceof BigDecimal decimal) {
            return decimal;
        }
        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }
        return new BigDecimal(String.valueOf(value));
    }

    private Object firstPresent(Map<?, ?> map, String first, String second) {
        Object value = map.get(first);
        return value != null ? value : map.get(second);
    }

    private Object valueOrDefault(Object value, Object fallback) {
        return value == null ? fallback : value;
    }
}
