package com.example.product.domain.model.product;

import java.util.Objects;

public class ProductId {
    private final Long id;

    public ProductId(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ProductId cannot be null");
        }
        this.id = id;
    }

    public Long getValue() {
        return id;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProductId productId = (ProductId) o;
        return id.equals(productId.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
