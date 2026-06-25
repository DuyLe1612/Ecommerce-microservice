package com.example.cart.application;

import com.example.cart.domain.Cart;
import com.example.cart.application.dto.CartItemAttribute;
import com.example.cart.application.dto.CartItemSnapshot;
import com.example.cart.infrastructure.product.ProductClient;
import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CartServiceTest {
    @Test
    void addItemStoresCartWithSevenDayTtlAndCalculatesSubtotal() {
        FakeCartStore store = new FakeCartStore();
        CartService service = new CartService(store, new FakeProductClient(), 7);

        var cart = service.addItem("42", 1001L, 2);

        assertEquals("42", cart.userId());
        assertEquals(1, cart.items().size());
        assertEquals(new BigDecimal("200.00"), cart.subtotal());
        assertEquals(Duration.ofDays(7), store.lastTtl);
    }

    @Test
    void removeItemDeletesOnlySelectedVariant() {
        FakeCartStore store = new FakeCartStore();
        CartService service = new CartService(store, new FakeProductClient(), 7);

        service.addItem("42", 1001L, 2);
        service.addItem("42", 1002L, 1);
        var cart = service.removeItem("42", 1001L);

        assertEquals(1, cart.items().size());
        assertEquals(1002L, cart.items().getFirst().variantId());
    }

    @Test
    void addItemStoresProductSnapshotForCartRendering() {
        FakeCartStore store = new FakeCartStore();
        CartService service = new CartService(store, new FakeProductClient(), 7);

        var cart = service.addItem("42", 1001L, 1, new CartItemSnapshot(
            10,
            "Keyboard Pro",
            "keyboard-pro",
            "https://cdn.example.com/keyboard.png",
            "Tekno",
            "KEY-PRO-BLACK",
            12,
            List.of(new CartItemAttribute("Color", "Black"))
        ));

        var item = cart.items().getFirst();
        assertEquals("Keyboard Pro", item.productName());
        assertEquals("keyboard-pro", item.productSlug());
        assertEquals("https://cdn.example.com/keyboard.png", item.primaryImage());
        assertEquals("Tekno", item.brandName());
        assertEquals("KEY-PRO-BLACK", item.sku());
        assertEquals(12, item.availableStock());
        assertEquals(List.of(new CartItemAttribute("Color", "Black")), item.attributes());
    }

    @Test
    void updateItemPreservesExistingProductSnapshot() {
        FakeCartStore store = new FakeCartStore();
        CartService service = new CartService(store, new FakeProductClient(), 7);

        service.addItem("42", 1001L, 1, new CartItemSnapshot(
            10,
            "Keyboard Pro",
            "keyboard-pro",
            "https://cdn.example.com/keyboard.png",
            "Tekno",
            "KEY-PRO-BLACK",
            12,
            List.of(new CartItemAttribute("Color", "Black"))
        ));
        var cart = service.updateItem("42", 1001L, 3);

        var item = cart.items().getFirst();
        assertEquals(3, item.quantity());
        assertEquals("Keyboard Pro", item.productName());
        assertEquals("keyboard-pro", item.productSlug());
        assertEquals("https://cdn.example.com/keyboard.png", item.primaryImage());
    }

    private static class FakeCartStore implements CartStore {
        private final Map<String, Cart> carts = new HashMap<>();
        private Duration lastTtl;

        @Override
        public Cart get(String userId) {
            return carts.getOrDefault(userId, new Cart());
        }

        @Override
        public void save(String userId, Cart cart, Duration ttl) {
            carts.put(userId, cart);
            lastTtl = ttl;
        }

        @Override
        public void delete(String userId) {
            carts.remove(userId);
        }
    }

    private static class FakeProductClient implements ProductClient {
        @Override
        public VariantInfo getVariant(Long variantId) {
            return new VariantInfo(
                variantId,
                10,
                "Keyboard",
                new BigDecimal("100.00"),
                "VND",
                "KEY-PRO",
                50,
                List.of(new CartItemAttribute("Switch", "Blue"))
            );
        }

        @Override
        public void ensureProductExists(Long productId) {
        }
    }
}
