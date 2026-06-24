package com.uit.orderservice.presentation.rest;

import com.uit.orderservice.application.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

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
        description = "Called by payment-service before initiating payment."
    )
    @GetMapping("/{orderId}/validate")
    public ResponseEntity<Map<String, Object>> validateForPayment(
            @PathVariable Long orderId,
            @RequestParam String userId,
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
}
