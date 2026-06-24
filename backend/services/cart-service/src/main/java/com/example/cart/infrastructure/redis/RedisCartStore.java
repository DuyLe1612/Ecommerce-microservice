package com.example.cart.infrastructure.redis;

import com.example.cart.application.CartStore;
import com.example.cart.domain.Cart;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RedisCartStore implements CartStore {
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public Cart get(String userId) {
        String value = redisTemplate.opsForValue().get(key(userId));
        if (value == null || value.isBlank()) {
            return new Cart();
        }
        try {
            return objectMapper.readValue(value, Cart.class);
        } catch (Exception e) {
            throw new IllegalStateException("Unable to read cart for user " + userId, e);
        }
    }

    @Override
    public void save(String userId, Cart cart, Duration ttl) {
        try {
            redisTemplate.opsForValue().set(key(userId), objectMapper.writeValueAsString(cart), ttl);
        } catch (Exception e) {
            throw new IllegalStateException("Unable to save cart for user " + userId, e);
        }
    }

    @Override
    public void delete(String userId) {
        redisTemplate.delete(key(userId));
    }

    private String key(String userId) {
        return "cart:" + userId;
    }
}
