package com.example.cart.presentation.dto;

import com.example.cart.application.dto.CartItemAttribute;
import com.example.cart.application.dto.CartItemSnapshot;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record AddCartItemRequest(
    @NotNull Long variantId,
    @Min(1) int quantity,
    Integer productId,
    String productName,
    String productSlug,
    String primaryImage,
    String brandName,
    String sku,
    Integer availableStock,
    List<CartItemAttribute> attributes
) {
    public CartItemSnapshot toSnapshot() {
        return new CartItemSnapshot(
            productId,
            productName,
            productSlug,
            primaryImage,
            brandName,
            sku,
            availableStock,
            attributes
        );
    }
}
