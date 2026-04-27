package com.example.product.domain.valueobject;

import java.util.Objects;

public class Sku {
    private final String value;

    public Sku(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("SKU cannot be empty");
        }
        // In a real system, you might add regex validation here
        this.value = value.toUpperCase();
    }

    public String getValue() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Sku sku = (Sku) o;
        return value.equals(sku.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }
}
