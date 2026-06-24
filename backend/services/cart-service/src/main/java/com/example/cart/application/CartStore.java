package com.example.cart.application;

import com.example.cart.domain.Cart;
import java.time.Duration;

public interface CartStore {
    Cart get(String userId);
    void save(String userId, Cart cart, Duration ttl);
    void delete(String userId);
}
