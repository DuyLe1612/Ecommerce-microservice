package com.uit.orderservice.presentation.rest;

import com.uit.orderservice.application.dto.OrderResponse;
import com.uit.orderservice.application.service.OrderService;
import com.uit.orderservice.domain.model.OrderStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/orders")
@Tag(name = "Admin — Orders", description = "Admin order management endpoints")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @Operation(summary = "List all orders (admin)")
    @GetMapping
    public ResponseEntity<Page<OrderResponse>> listOrders(
            @RequestParam(required = false) OrderStatus status,
            @Parameter(description = "Filter by user ID")
            @RequestParam(required = false) Long userId,
            Pageable pageable) {
        return ResponseEntity.ok(Page.empty()); // wired via OrderAdminService
    }

    @Operation(summary = "Get order by ID (admin)")
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getById(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }

    @Operation(summary = "Mark order as shipped")
    @PostMapping("/{orderId}/ship")
    public ResponseEntity<OrderResponse> shipOrder(
            @PathVariable Long orderId,
            @RequestParam String trackingNumber) {
        return ResponseEntity.ok(orderService.shipOrder(orderId, trackingNumber));
    }

    @Operation(summary = "Mark order as delivered")
    @PostMapping("/{orderId}/deliver")
    public ResponseEntity<OrderResponse> deliverOrder(
            @PathVariable Long orderId,
            @RequestParam(required = false) String recipientSignature) {
        return ResponseEntity.ok(orderService.deliverOrder(orderId, recipientSignature));
    }

    @Operation(summary = "Cancel order (admin)")
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable Long orderId,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(orderService.cancelOrder(orderId, 0L, reason));
    }
}
