package com.uit.orderservice.presentation.rest;

import com.uit.orderservice.application.dto.CreateOrderRequest;
import com.uit.orderservice.application.dto.OrderResponse;
import com.uit.orderservice.application.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Orders", description = "Order lifecycle endpoints")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @Operation(summary = "Create a new order")
    @PostMapping("/create")
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            @Parameter(description = "User ID — set by API gateway after auth")
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        Long effectiveUserId = request.userId() != null ? request.userId() : userId;

        var requestWithUser = new CreateOrderRequest(
            effectiveUserId, request.items(), request.subtotal(),
            request.discountAmount(), request.shippingFee(), request.currency(),
            request.shippingAddress(), request.couponCode(),
            request.couponId(), request.notes()
        );

        return ResponseEntity.ok(orderService.createOrder(requestWithUser));
    }

    @Operation(summary = "Get order by order number")
    @GetMapping("/{orderNumber}")
    public ResponseEntity<OrderResponse> getByNumber(@PathVariable String orderNumber) {
        return ResponseEntity.ok(orderService.getOrderByNumber(orderNumber));
    }

    @Operation(summary = "Get order by ID")
    @GetMapping("/by-id/{orderId}")
    public ResponseEntity<OrderResponse> getById(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }

    @Operation(summary = "Get order history for current user")
    @GetMapping("/history")
    public ResponseEntity<List<OrderResponse>> getHistory(
            @Parameter(description = "User ID — set by API gateway after auth")
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return ResponseEntity.ok(orderService.getOrderHistory(userId));
    }

    @Operation(summary = "Cancel an order")
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable Long orderId,
            @RequestParam(required = false) String reason,
            @Parameter(description = "User ID — set by API gateway after auth")
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return ResponseEntity.ok(orderService.cancelOrder(orderId, userId, reason));
    }
}
