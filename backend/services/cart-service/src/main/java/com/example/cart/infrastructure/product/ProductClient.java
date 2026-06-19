package com.example.cart.infrastructure.product;

public interface ProductClient {
    VariantInfo getVariant(Long variantId);
    void ensureProductExists(Long productId);

    record VariantInfo(Long variantId, Integer productId, String name, java.math.BigDecimal price, String currency) {}
}
