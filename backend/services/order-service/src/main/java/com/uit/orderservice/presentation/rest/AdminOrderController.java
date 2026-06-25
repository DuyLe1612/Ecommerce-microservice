package com.uit.orderservice.presentation.rest;

import com.uit.orderservice.application.dto.OrderResponse;
import com.uit.orderservice.application.service.OrderService;
import com.uit.orderservice.domain.model.OrderStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

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
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            Pageable pageable) {

        LocalDateTime from = startDate != null ? LocalDateTime.parse(startDate + "T00:00:00") : null;
        LocalDateTime to = endDate != null ? LocalDateTime.parse(endDate + "T23:59:59") : null;

        return ResponseEntity.ok(orderService.listOrders(status, userId, from, to, pageable));
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
            @RequestBody ShipOrderRequest request) {
        return ResponseEntity.ok(orderService.shipOrder(orderId,
                request.trackingNumber() != null ? request.trackingNumber() : ""));
    }

    public record ShipOrderRequest(String trackingNumber, String carrier) {}

    @Operation(summary = "Mark order as delivered")
    @PostMapping("/{orderId}/deliver")
    public ResponseEntity<OrderResponse> deliverOrder(
            @PathVariable Long orderId,
            @RequestBody DeliverOrderRequest request) {
        return ResponseEntity.ok(orderService.deliverOrder(orderId, request.recipientSignature()));
    }

    public record DeliverOrderRequest(String recipientSignature) {}

    @Operation(summary = "Cancel order (admin)")
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable Long orderId,
            @RequestBody CancelOrderRequest request) {
        return ResponseEntity.ok(orderService.cancelOrder(orderId, null, request.reason()));
    }

    public record CancelOrderRequest(String reason) {}

    @Operation(summary = "Update order status (admin)")
    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(orderService.updateStatus(orderId, request.status(), request.notes()));
    }

    public record UpdateOrderStatusRequest(
            OrderStatus status,
            String notes
    ) {}
}
