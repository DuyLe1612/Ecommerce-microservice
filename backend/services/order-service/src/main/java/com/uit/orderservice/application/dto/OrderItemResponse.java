package com.uit.orderservice.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

@Schema(description = "Order item detail for display purposes")
public record OrderItemResponse(
    @Schema(description = "Item ID", example = "1")
    Long id,

    @Schema(description = "Product ID", example = "10")
    Long productId,

    @Schema(description = "Product name", example = "iPhone 15 Pro")
    String productName,

    @Schema(description = "Quantity ordered", example = "2")
    int quantity,

    @Schema(description = "Unit price", example = "25000000")
    BigDecimal unitPrice,

    @Schema(description = "Line total (quantity × unitPrice)", example = "50000000")
    BigDecimal subtotal,

    @Schema(description = "Primary image URL of the product", example = "https://example.com/iphone15.jpg")
    String productImageUrl
) {}
