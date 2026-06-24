package com.uit.orderservice.presentation.rest;

import com.uit.orderservice.application.dto.CreateOrderRequest;
import com.uit.orderservice.application.dto.OrderResponse;
import com.uit.orderservice.application.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

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
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        String userId = currentUserId();
        var requestWithUser = new CreateOrderRequest(
            userId, request.items(), request.subtotal(),
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

    @Operation(summary = "Get order history for current user (paginated)")
    @GetMapping("/history")
    public ResponseEntity<Page<OrderResponse>> getHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(page, pageSize);
        return ResponseEntity.ok(orderService.getOrderHistory(currentUserId(), pageable));
    }

    @Operation(summary = "Cancel an order")
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable Long orderId,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(orderService.cancelOrder(orderId, currentUserId(), reason));
    }

    private String currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return auth.getName();
    }
}
