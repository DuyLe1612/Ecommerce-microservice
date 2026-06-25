package com.uit.orderservice.infrastructure.external;

import java.math.BigDecimal;
import java.util.List;

/**
 * Client for communicating with the product-service to validate order items.
 * Implementations can be swapped between mock (for development/testing) and real (for production)
 * using Spring's @ConditionalOnProperty mechanism.
 */
public interface ProductServiceClient {

    /**
     * Validates a list of order items against the product-service.
     * Checks that each product variant exists, is in stock, and has the correct price.
     *
     * @param items list of items to validate, each with productId (variantId) and quantity
     * @return batch validation result containing per-item results
     */
    BatchProductValidationResult validateItems(List<ProductItemRequest> items);

    record ProductItemRequest(Long productId, int quantity) {}

    record BatchProductValidationResult(
            boolean allValid,
            List<ItemValidationResult> results
    ) {}

    record ItemValidationResult(
            Long productId,
            boolean exists,
            boolean inStock,
            int availableStock,
            int requestedQuantity,
            BigDecimal price,
            String productImageUrl,
            String status,
            String error
    ) {
        public boolean valid() { return exists && inStock; }
    }

    /**
     * Reserve stock for the given order. Called synchronously after order persisted.
     * Throws ProductServiceUnavailableException if product-service cannot be reached.
     * Throws RuntimeException with message if stock is insufficient.
     */
    void reserveStock(Long orderId, List<StockReservationItem> items);

    record StockReservationItem(Long productId, int quantity) {}
}
