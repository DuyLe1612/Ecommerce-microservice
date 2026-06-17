package com.uit.orderservice.presentation.rest;

import com.uit.orderservice.application.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.Map;

/**
 * Internal endpoint for payment-service to validate order ownership and amount.
 * Not exposed via API gateway — only accessible from internal Docker network.
 */
@RestController
@RequestMapping("/internal/orders")
@Tag(name = "Internal — Order Validation", description = "Internal endpoints for service-to-service communication")
public class InternalOrderController {

    private final OrderService orderService;

    public InternalOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @Operation(summary = "Validate order for payment")
    @GetMapping("/{orderId}/validate")
    public ResponseEntity<Map<String, Object>> validateForPayment(
            @PathVariable Long orderId,
            @Parameter(description = "User ID to verify ownership")
            @RequestParam Long userId,
            @Parameter(description = "Amount to verify against order total")
            @RequestParam BigDecimal amount) {

        try {
            var order = orderService.getOrderById(orderId);
            return ResponseEntity.ok(Map.of(
                "exists",          true,
                "ownershipValid",  order.userId().equals(userId),
                "userId",          order.userId(),
                "expectedAmount",  order.totalAmount(),
                "currency",        order.currency(),
                "status",          order.status()
            ));
        } catch (OrderService.OrderNotFoundException e) {
            return ResponseEntity.ok(Map.of(
                "exists",         false,
                "userId",         userId,
                "expectedAmount", amount,
                "currency",       "VND",
                "status",         "NOT_FOUND"
            ));
        }
    }

    @Operation(summary = "Verify product purchase (for review-service)")
    @GetMapping("/verify-purchase")
    public ResponseEntity<Map<String, Object>> verifyPurchase(
            @RequestParam Long userId,
            @RequestParam Long productId) {

        boolean verified = orderService.hasUserPurchasedProduct(userId, productId);
        return ResponseEntity.ok(Map.of("verified", verified));
    }
}
