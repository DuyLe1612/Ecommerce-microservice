package com.example.cart.application;

import com.example.cart.domain.Cart;
import com.example.cart.infrastructure.product.ProductClient;
import java.math.BigDecimal;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CartServiceTest {
    @Test
    void addItemStoresCartWithSevenDayTtlAndCalculatesSubtotal() {
        FakeCartStore store = new FakeCartStore();
        CartService service = new CartService(store, new FakeProductClient(), 7);

        var cart = service.addItem(42L, 1001L, 2);

        assertEquals(42L, cart.userId());
        assertEquals(1, cart.items().size());
        assertEquals(new BigDecimal("200.00"), cart.subtotal());
        assertEquals(Duration.ofDays(7), store.lastTtl);
    }

    @Test
    void removeItemDeletesOnlySelectedVariant() {
        FakeCartStore store = new FakeCartStore();
        CartService service = new CartService(store, new FakeProductClient(), 7);

        service.addItem(42L, 1001L, 2);
        service.addItem(42L, 1002L, 1);
        var cart = service.removeItem(42L, 1001L);

        assertEquals(1, cart.items().size());
        assertEquals(1002L, cart.items().getFirst().variantId());
    }

    private static class FakeCartStore implements CartStore {
        private final Map<Long, Cart> carts = new HashMap<>();
        private Duration lastTtl;

        @Override
        public Cart get(Long userId) {
            return carts.getOrDefault(userId, new Cart());
        }

        @Override
        public void save(Long userId, Cart cart, Duration ttl) {
            carts.put(userId, cart);
            lastTtl = ttl;
        }

        @Override
        public void delete(Long userId) {
            carts.remove(userId);
        }
    }

    private static class FakeProductClient implements ProductClient {
        @Override
        public VariantInfo getVariant(Long variantId) {
            return new VariantInfo(variantId, 10, "Keyboard", new BigDecimal("100.00"), "VND");
        }

        @Override
        public void ensureProductExists(Long productId) {
        }
    }
}
