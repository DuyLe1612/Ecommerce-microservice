package com.example.cart.infrastructure.product;

import com.example.cart.application.dto.CartItemAttribute;
import java.math.BigDecimal;
import java.util.List;

public interface ProductClient {
    VariantInfo getVariant(Long variantId);
    void ensureProductExists(Long productId);

    record VariantInfo(
        Long variantId,
        Integer productId,
        String name,
        BigDecimal price,
        String currency,
        String sku,
        Integer availableStock,
        List<CartItemAttribute> attributes
    ) {
        public VariantInfo {
            attributes = attributes == null ? List.of() : List.copyOf(attributes);
        }

        public VariantInfo(Long variantId, Integer productId, String name, BigDecimal price, String currency) {
            this(variantId, productId, name, price, currency, null, null, List.of());
        }
    }
}
