package com.uit.orderservice.presentation.rest;

import com.uit.orderservice.infrastructure.external.MockProductScenarioStore;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.Map;

/**
 * Dev/test utility controller for simulating product-service responses.
 * Only available when order.external.product.mode=mock (default).
 * In production, set order.external.product.mode=real.
 */
@RestController
@RequestMapping("/internal/simulator/product")
@Tag(name = "Dev — Product Simulator", description = "Simulate product-service responses for development/testing")
public class ProductSimulatorController {

    private final MockProductScenarioStore scenarioStore;

    public ProductSimulatorController(MockProductScenarioStore scenarioStore) {
        this.scenarioStore = scenarioStore;
    }

    @Operation(summary = "Set a mock product scenario for a specific variant")
    @PostMapping("/set-scenario")
    public ResponseEntity<Map<String, String>> setScenario(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Scenario configuration")
            @RequestBody MockScenarioRequest request) {

        var scenario = new MockProductScenarioStore.ProductScenario(
                request.price() != null ? request.price() : new BigDecimal("100.00"),
                request.stock() != null ? request.stock() : 100,
                request.status() != null ? request.status() : "AVAILABLE",
                request.errorMessage()
        );

        scenarioStore.setScenario(request.productId(), scenario);

        return ResponseEntity.ok(Map.of(
            "status", "ok",
            "productId", String.valueOf(request.productId()),
            "scenario", scenario.status() + " | stock=" + scenario.stock() + " | price=" + scenario.price()
        ));
    }

    @Operation(summary = "Set a mock out-of-stock scenario for a product variant")
    @PostMapping("/set-out-of-stock/{productId}")
    public ResponseEntity<Map<String, String>> setOutOfStock(
            @Parameter(description = "Product variant ID") @PathVariable Long productId,
            @Parameter(description = "Price for the product") @RequestParam(required = false) BigDecimal price) {
        scenarioStore.setScenario(productId,
            MockProductScenarioStore.ProductScenario.outOfStock(
                price != null ? price : new BigDecimal("100.00")));
        return ResponseEntity.ok(Map.of("status", "ok", "productId", String.valueOf(productId), "scenario", "OUT_OF_STOCK"));
    }

    @Operation(summary = "Set a mock not-found scenario for a product variant")
    @PostMapping("/set-not-found/{productId}")
    public ResponseEntity<Map<String, String>> setNotFound(
            @Parameter(description = "Product variant ID") @PathVariable Long productId) {
        scenarioStore.setScenario(productId,
            MockProductScenarioStore.ProductScenario.notFound(null));
        return ResponseEntity.ok(Map.of("status", "ok", "productId", String.valueOf(productId), "scenario", "NOT_FOUND"));
    }

    @Operation(summary = "Clear all mock product scenarios")
    @DeleteMapping("/clear-all")
    public ResponseEntity<Map<String, String>> clearAll() {
        scenarioStore.clearAll();
        return ResponseEntity.ok(Map.of("status", "ok", "message", "All product scenarios cleared"));
    }

    @Operation(summary = "Remove mock scenario for a specific product")
    @DeleteMapping("/{productId}")
    public ResponseEntity<Map<String, String>> removeScenario(
            @Parameter(description = "Product variant ID") @PathVariable Long productId) {
        scenarioStore.removeScenario(productId);
        return ResponseEntity.ok(Map.of("status", "ok", "productId", String.valueOf(productId)));
    }

    public record MockScenarioRequest(
            Long productId,
            BigDecimal price,
            Integer stock,
            String status,
            String errorMessage
    ) {}
}
