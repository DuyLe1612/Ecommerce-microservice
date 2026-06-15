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
 * Called by payment-service to validate an order before initiating payment.
 * No auth required — payment-service is an internal service.
 */
@RestController
@RequestMapping("/api/orders")
@Tag(name = "Internal — Order Validation", description = "Internal endpoints for service-to-service calls")
public class OrderValidationController {

    private final OrderService orderService;

    public OrderValidationController(OrderService orderService) {
        this.orderService = orderService;
    }

    @Operation(
        summary = "Validate order for payment",
        description = "Called by payment-service before initiating payment. " +
            "Returns order existence, ownership, expected amount, and status."
    )
    @GetMapping("/{orderId}/validate")
    public ResponseEntity<Map<String, Object>> validateForPayment(
            @Parameter(description = "Order ID", example = "123")
            @PathVariable Long orderId,
            @Parameter(description = "User ID making the request", example = "1")
            @RequestParam Long userId,
            @Parameter(description = "Amount the user claims the order costs", example = "100000")
            @RequestParam BigDecimal amount) {

        try {
            var order = orderService.getOrderById(orderId);
            if (!order.userId().equals(userId)) {
                return ResponseEntity.ok(Map.of(
                    "exists", true,
                    "userId", order.userId(),
                    "expectedAmount", order.totalAmount(),
                    "currency", order.currency(),
                    "status", order.status()
                ));
            }
            return ResponseEntity.ok(Map.of(
                "exists", true,
                "userId", order.userId(),
                "expectedAmount", order.totalAmount(),
                "currency", order.currency(),
                "status", order.status()
            ));
        } catch (OrderService.OrderNotFoundException e) {
            return ResponseEntity.ok(Map.of("exists", false));
        }
    }
}
