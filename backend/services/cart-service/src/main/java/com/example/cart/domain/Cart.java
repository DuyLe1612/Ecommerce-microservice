package com.example.cart.domain;

import com.example.cart.application.dto.CartItem;
import java.util.ArrayList;
import java.util.List;

public class Cart {
    private List<CartItem> items = new ArrayList<>();

    public List<CartItem> getItems() {
        return items;
    }

    public void setItems(List<CartItem> items) {
        this.items = items == null ? new ArrayList<>() : new ArrayList<>(items);
    }

    public void upsert(CartItem item) {
        remove(item.variantId());
        items.add(item);
    }

    public void remove(Long variantId) {
        items.removeIf(item -> item.variantId().equals(variantId));
    }
}
