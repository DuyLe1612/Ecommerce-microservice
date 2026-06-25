package com.example.cart.application.dto;

import java.util.List;

public record CartItemSnapshot(
    Integer productId,
    String productName,
    String productSlug,
    String primaryImage,
    String brandName,
    String sku,
    Integer availableStock,
    List<CartItemAttribute> attributes
) {
    public CartItemSnapshot {
        attributes = attributes == null ? List.of() : List.copyOf(attributes);
    }

    public static CartItemSnapshot empty() {
        return new CartItemSnapshot(null, null, null, null, null, null, null, List.of());
    }
}
