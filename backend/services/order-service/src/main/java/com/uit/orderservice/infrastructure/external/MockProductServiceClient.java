package com.uit.orderservice.infrastructure.external;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Mock implementation of ProductServiceClient for development and testing.
 * Returns predefined responses configured via simulator endpoints.
 * This avoids needing a live product-service while building the order-service.
 */
@Component
@ConditionalOnProperty(name = "order.external.product.mode", havingValue = "mock", matchIfMissing = true)
public class MockProductServiceClient implements ProductServiceClient {

    private static final Logger log = LoggerFactory.getLogger(MockProductServiceClient.class);

    private final MockProductScenarioStore scenarioStore;

    public MockProductServiceClient(MockProductScenarioStore scenarioStore) {
        this.scenarioStore = scenarioStore;
    }

    @Override
    public BatchProductValidationResult validateItems(List<ProductItemRequest> items) {
        log.info("[MOCK] Validating {} items against product-service", items.size());

        List<ItemValidationResult> results = new ArrayList<>();
        boolean allValid = true;

        for (ProductItemRequest item : items) {
            MockProductScenarioStore.ProductScenario scenario =
                    scenarioStore.getScenario(item.productId());

            if (scenario == null) {
                // Default valid product for unknown IDs
                results.add(new ItemValidationResult(
                        item.productId(), true, true,
                        100, item.quantity(),
                        new BigDecimal("100.00"), "AVAILABLE", null));
                log.debug("[MOCK] Unknown productId={}, returning default VALID", item.productId());
            } else {
                boolean inStock = scenario.stock() >= item.quantity();
                results.add(new ItemValidationResult(
                        item.productId(),
                        true,
                        inStock,
                        scenario.stock(),
                        item.quantity(),
                        scenario.price(),
                        scenario.status(),
                        inStock ? null : "Insufficient stock. Available: " + scenario.stock()));
                allValid &= inStock;
                log.debug("[MOCK] productId={} -> exists=true, inStock={}, stock={}",
                        item.productId(), inStock, scenario.stock());
            }
        }

        log.info("[MOCK] Validation complete: allValid={}, results={}", allValid, results.size());
        return new BatchProductValidationResult(allValid, results);
    }

    @Override
    public void reserveStock(Long orderId, List<StockReservationItem> items) {
        log.info("[MOCK] Stock reservation accepted: orderId={}, items={}", orderId, items.size());
        // Mock always succeeds — no stock tracking in mock mode
    }
}
