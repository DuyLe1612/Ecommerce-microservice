package com.uit.orderservice.infrastructure.external;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Real implementation of ProductServiceClient that calls the actual product-service
 * over HTTP using WebClient. Activated when order.external.product.mode=real.
 */
@Component
@ConditionalOnProperty(name = "order.external.product.mode", havingValue = "real")
public class RealProductServiceClient implements ProductServiceClient {

    private static final Logger log = LoggerFactory.getLogger(RealProductServiceClient.class);
    private static final Duration TIMEOUT = Duration.ofSeconds(5);

    private final WebClient webClient;

    public RealProductServiceClient(
            @Qualifier("productServiceWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    @Override
    public BatchProductValidationResult validateItems(List<ProductItemRequest> items) {
        log.info("[REAL] Calling product-service /internal/products/validate for {} items", items.size());

        BatchValidationRequest request = new BatchValidationRequest(
                items.stream()
                        .map(i -> new BatchValidationRequest.ItemRequest(i.productId(), i.quantity()))
                        .toList()
        );

        try {
            BatchValidationResponse response = webClient
                    .post()
                    .uri("/internal/products/validate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, clientResp ->
                            Mono.error(new RuntimeException("Product service error: " + clientResp.statusCode())))
                    .bodyToMono(BatchValidationResponse.class)
                    .timeout(TIMEOUT)
                    .block();

            if (response == null) {
                log.error("[REAL] product-service returned null response");
                return buildAllErrorResult(items, "Product service returned null response");
            }

            log.info("[REAL] product-service validation complete: allValid={}, results={}",
                    response.allValid(), response.results().size());

            List<ItemValidationResult> results = response.results().stream()
                    .map(r -> new ItemValidationResult(
                            r.productId(),
                            r.exists(),
                            r.inStock(),
                            r.availableStock(),
                            r.requestedQuantity(),
                            r.price(),
                            r.status(),
                            r.error()
                    ))
                    .toList();

            return new BatchProductValidationResult(response.allValid(), results);

        } catch (Exception ex) {
            log.error("[REAL] Failed to call product-service: {}", ex.getMessage(), ex);
            return buildAllErrorResult(items, "Product service unavailable: " + ex.getMessage());
        }
    }

    private BatchProductValidationResult buildAllErrorResult(
            List<ProductItemRequest> items, String error) {
        List<ItemValidationResult> results = items.stream()
                .map(item -> new ItemValidationResult(
                        item.productId(), false, false, 0,
                        item.quantity(), null, null, error))
                .toList();
        return new BatchProductValidationResult(false, results);
    }

    // DTOs mirroring the product-service response

    record BatchValidationRequest(List<ItemRequest> items) {
        record ItemRequest(Long productId, int quantity) {}
    }

    record BatchValidationResponse(boolean allValid, List<ServiceItemResult> results) {}

    record ServiceItemResult(
            Long productId,
            boolean exists,
            boolean inStock,
            int availableStock,
            int requestedQuantity,
            BigDecimal price,
            String status,
            String error
    ) {}

    @Override
    public void reserveStock(Long orderId, List<StockReservationItem> items) {
        log.info("[REAL] Reserving stock: orderId={}, {} items", orderId, items.size());
        for (StockReservationItem item : items) {
            try {
                Map<String, Object> body = Map.of(
                    "variantId", item.productId(),
                    "orderId", orderId,
                    "quantity", item.quantity()
                );
                webClient.post()
                    .uri("/internal/products/stock/reserve")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, resp ->
                        resp.bodyToMono(String.class).map(err ->
                            new RuntimeException("Stock reservation failed for productId="
                                + item.productId() + ": " + err)))
                    .bodyToMono(Void.class)
                    .timeout(TIMEOUT)
                    .block();
                log.debug("[REAL] Stock reserved: productId={}, qty={}", item.productId(), item.quantity());
            } catch (RuntimeException ex) {
                log.error("[REAL] Stock reservation failed: orderId={}, productId={}: {}",
                    orderId, item.productId(), ex.getMessage());
                throw new com.uit.orderservice.application.exception.ProductServiceUnavailableException(
                    "Stock reservation failed for productId=" + item.productId()
                        + ": " + ex.getMessage(), ex);
            }
        }
    }
}
