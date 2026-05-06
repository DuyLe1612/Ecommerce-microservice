package com.example.search.infrastructure.client;

import com.example.search.infrastructure.client.dto.ApiResponse;
import com.example.search.infrastructure.client.dto.ProductDetailResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

@Slf4j
@Component
public class ProductServiceClient {
    private final WebClient webClient;
    private final AtomicInteger consecutiveFailures = new AtomicInteger(0);
    private final AtomicReference<Instant> circuitOpenedAt = new AtomicReference<>(null);

    private static final int MAX_RETRY = 3;
    private static final int FAILURE_THRESHOLD = 5;
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(2);
    private static final Duration CIRCUIT_OPEN_WINDOW = Duration.ofSeconds(30);

    public ProductServiceClient(WebClient.Builder builder, @Value("${product.service.base-url:http://localhost:8080}") String baseUrl) {
        this.webClient = builder.baseUrl(baseUrl).build();
    }

    public ProductDetailResponse getProductDetail(String slug) {
        if (isCircuitOpen()) {
            log.warn("event=product_client_circuit_open slug={}", slug);
            return null;
        }
        RuntimeException lastException = null;
        for (int attempt = 1; attempt <= MAX_RETRY; attempt++) {
            try {
                ApiResponse<ProductDetailResponse> response = webClient.get()
                        .uri("/internal/products/{slug}", slug)
                        .retrieve()
                        .bodyToMono(new org.springframework.core.ParameterizedTypeReference<ApiResponse<ProductDetailResponse>>() {})
                        .timeout(REQUEST_TIMEOUT)
                        .onErrorResume(ex -> Mono.empty())
                        .block();
                if (response != null && response.isSuccess()) {
                    onCallSuccess();
                    return response.getData();
                }
            } catch (RuntimeException ex) {
                lastException = ex;
                log.warn("event=product_client_retry attempt={} slug={} error={}", attempt, slug, ex.getMessage());
            }
        }
        onCallFailure();
        if (lastException != null) {
            log.error("event=product_client_failed slug={} error={}", slug, lastException.getMessage());
        }
        return null;
    }

    private boolean isCircuitOpen() {
        Instant openedAt = circuitOpenedAt.get();
        if (openedAt == null) return false;
        if (Instant.now().isAfter(openedAt.plus(CIRCUIT_OPEN_WINDOW))) {
            circuitOpenedAt.set(null);
            consecutiveFailures.set(0);
            return false;
        }
        return true;
    }

    private void onCallSuccess() {
        consecutiveFailures.set(0);
        circuitOpenedAt.set(null);
    }

    private void onCallFailure() {
        int failures = consecutiveFailures.incrementAndGet();
        if (failures >= FAILURE_THRESHOLD) {
            circuitOpenedAt.compareAndSet(null, Instant.now());
        }
    }
}
