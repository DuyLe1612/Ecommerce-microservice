package com.example.cart.application;

import com.example.cart.domain.Cart;
import java.time.Duration;

public interface CartStore {
    Cart get(Long userId);
    void save(Long userId, Cart cart, Duration ttl);
    void delete(Long userId);
}
