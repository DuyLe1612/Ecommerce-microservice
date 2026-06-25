package com.uit.orderservice.application.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Full order details including items")
public record OrderResponse(
    @Schema(description = "Order ID", example = "1")
    Long id,

    @Schema(description = "Human-readable order number", example = "ORD-1234567890-42")
    String orderNumber,

    @Schema(description = "User ID who placed the order")
    String userId,

    @Schema(description = "Order status code", example = "PENDING_PAYMENT")
    String status,

    @Schema(description = "Human-readable status name", example = "Chờ thanh toán")
    String statusName,

    @Schema(description = "Total order amount", example = "55000000")
    BigDecimal totalAmount,

    @Schema(description = "Currency code", example = "VND")
    String currency,

    @Schema(description = "Order creation timestamp")
    LocalDateTime createdAt,

    @Schema(description = "Last update timestamp")
    LocalDateTime updatedAt,

    @Schema(description = "Shipping address snapshot stored when the order was created")
    ShippingAddressResponse shippingAddress,

    @Schema(description = "List of order items")
    List<OrderItemResponse> items
) {
    public OrderResponse(
            Long id,
            String orderNumber,
            String userId,
            String status,
            String statusName,
            BigDecimal totalAmount,
            String currency,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            List<OrderItemResponse> items) {
        this(id, orderNumber, userId, status, statusName, totalAmount, currency,
            createdAt, updatedAt, null, items);
    }
}
