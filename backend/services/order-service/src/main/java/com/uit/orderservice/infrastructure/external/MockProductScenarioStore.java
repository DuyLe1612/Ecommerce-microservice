package com.uit.orderservice.infrastructure.external;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory store for mock product scenarios used during development/testing.
 * Allows simulator endpoints to configure predefined product validation responses
 * without requiring a real product-service.
 */
@Component
public class MockProductScenarioStore {

    private static final Logger log = LoggerFactory.getLogger(MockProductScenarioStore.class);

    private final Map<Long, ProductScenario> scenarios = new ConcurrentHashMap<>();

    public ProductScenario getScenario(Long productId) {
        return scenarios.get(productId);
    }

    public void setScenario(Long productId, ProductScenario scenario) {
        scenarios.put(productId, scenario);
        log.info("[MOCK-STORE] Set scenario for productId={}: {}", productId, scenario);
    }

    public void removeScenario(Long productId) {
        scenarios.remove(productId);
        log.info("[MOCK-STORE] Removed scenario for productId={}", productId);
    }

    public void clearAll() {
        scenarios.clear();
        log.info("[MOCK-STORE] Cleared all scenarios");
    }

    public record ProductScenario(
            BigDecimal price,
            int stock,
            String status,
            String errorMessage
    ) {
        public static ProductScenario available(BigDecimal price, int stock) {
            return new ProductScenario(price, stock, "AVAILABLE", null);
        }

        public static ProductScenario outOfStock(BigDecimal price) {
            return new ProductScenario(price, 0, "OUT_OF_STOCK", "Product is out of stock");
        }

        public static ProductScenario notFound(BigDecimal price) {
            return new ProductScenario(price, 0, "NOT_FOUND", "Product variant not found");
        }

        public static ProductScenario discontinued(BigDecimal price) {
            return new ProductScenario(price, 0, "DISCONTINUED", "Product has been discontinued");
        }

        public static ProductScenario insufficientStock(BigDecimal price, int available) {
            return new ProductScenario(price, available, "AVAILABLE",
                    "Insufficient stock. Available: " + available);
        }
    }
}
