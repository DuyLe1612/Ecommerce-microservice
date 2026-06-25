package com.example.cart.application.dto;

import java.math.BigDecimal;
import java.util.List;

public record CartItem(
    Long variantId,
    Integer productId,
    String name,
    BigDecimal price,
    String currency,
    int quantity,
    String productName,
    String productSlug,
    String primaryImage,
    String brandName,
    String sku,
    Integer availableStock,
    List<CartItemAttribute> attributes
) {
    public CartItem {
        attributes = attributes == null ? List.of() : List.copyOf(attributes);
    }

    public CartItem(
            Long variantId,
            Integer productId,
            String name,
            BigDecimal price,
            String currency,
            int quantity) {
        this(variantId, productId, name, price, currency, quantity, null, null, null, null, null, null, List.of());
    }
}
