package com.example.cart.application;

import com.example.cart.application.dto.CartItem;
import com.example.cart.application.dto.CartItemAttribute;
import com.example.cart.application.dto.CartResponse;
import com.example.cart.application.dto.CartItemSnapshot;
import com.example.cart.domain.Cart;
import com.example.cart.infrastructure.product.ProductClient;
import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class CartService {
    private final CartStore cartStore;
    private final ProductClient productClient;
    private final long ttlDays;

    public CartService(
            CartStore cartStore,
            ProductClient productClient,
            @Value("${cart.ttl-days:7}") long ttlDays) {
        this.cartStore = cartStore;
        this.productClient = productClient;
        this.ttlDays = ttlDays;
    }

    public CartResponse getCart(String userId) {
        return toResponse(userId, cartStore.get(userId));
    }

    public CartResponse addItem(String userId, Long variantId, int quantity) {
        return addItem(userId, variantId, quantity, CartItemSnapshot.empty());
    }

    public CartResponse addItem(String userId, Long variantId, int quantity, CartItemSnapshot snapshot) {
        ProductClient.VariantInfo variant = productClient.getVariant(variantId);
        Cart cart = cartStore.get(userId);
        cart.upsert(toCartItem(variant, quantity, snapshot, null));
        cartStore.save(userId, cart, Duration.ofDays(ttlDays));
        return toResponse(userId, cart);
    }

    public CartResponse updateItem(String userId, Long variantId, int quantity) {
        ProductClient.VariantInfo variant = productClient.getVariant(variantId);
        Cart cart = cartStore.get(userId);
        CartItem existing = cart.getItems().stream()
            .filter(item -> item.variantId().equals(variantId))
            .findFirst()
            .orElse(null);
        cart.upsert(toCartItem(variant, quantity, snapshotFrom(existing), existing));
        cartStore.save(userId, cart, Duration.ofDays(ttlDays));
        return toResponse(userId, cart);
    }

    public CartResponse removeItem(String userId, Long variantId) {
        Cart cart = cartStore.get(userId);
        cart.remove(variantId);
        cartStore.save(userId, cart, Duration.ofDays(ttlDays));
        return toResponse(userId, cart);
    }

    public void clear(String userId) {
        cartStore.delete(userId);
    }

    public CartResponse snapshot(String userId) {
        return getCart(userId);
    }

    private CartResponse toResponse(String userId, Cart cart) {
        BigDecimal subtotal = cart.getItems().stream()
            .map(item -> item.price().multiply(BigDecimal.valueOf(item.quantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        String currency = cart.getItems().stream()
            .findFirst()
            .map(CartItem::currency)
            .orElse("VND");
        int totalItems = cart.getItems().stream()
            .mapToInt(CartItem::quantity)
            .sum();
        return new CartResponse(userId, cart.getItems(), subtotal, currency, totalItems);
    }

    private CartItem toCartItem(
            ProductClient.VariantInfo variant,
            int quantity,
            CartItemSnapshot snapshot,
            CartItem existing) {
        CartItemSnapshot safeSnapshot = snapshot == null ? CartItemSnapshot.empty() : snapshot;
        return new CartItem(
            variant.variantId(),
            firstPresent(safeSnapshot.productId(), variant.productId(), existing == null ? null : existing.productId()),
            firstPresent(variant.name(), safeSnapshot.sku(), existing == null ? null : existing.name()),
            variant.price(),
            firstPresent(variant.currency(), existing == null ? null : existing.currency(), "VND"),
            quantity,
            firstPresent(safeSnapshot.productName(), existing == null ? null : existing.productName()),
            firstPresent(safeSnapshot.productSlug(), existing == null ? null : existing.productSlug()),
            firstPresent(safeSnapshot.primaryImage(), existing == null ? null : existing.primaryImage()),
            firstPresent(safeSnapshot.brandName(), existing == null ? null : existing.brandName()),
            firstPresent(safeSnapshot.sku(), variant.sku(), existing == null ? null : existing.sku()),
            firstPresent(safeSnapshot.availableStock(), variant.availableStock(), existing == null ? null : existing.availableStock()),
            firstPresentList(safeSnapshot.attributes(), variant.attributes(), existing == null ? null : existing.attributes())
        );
    }

    private CartItemSnapshot snapshotFrom(CartItem item) {
        if (item == null) {
            return CartItemSnapshot.empty();
        }
        return new CartItemSnapshot(
            item.productId(),
            item.productName(),
            item.productSlug(),
            item.primaryImage(),
            item.brandName(),
            item.sku(),
            item.availableStock(),
            item.attributes()
        );
    }

    @SafeVarargs
    private final <T> T firstPresent(T... values) {
        for (T value : values) {
            if (value instanceof String text && text.isBlank()) {
                continue;
            }
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    @SafeVarargs
    private final List<CartItemAttribute> firstPresentList(List<CartItemAttribute>... values) {
        if (values == null) {
            return List.of();
        }
        for (List<CartItemAttribute> value : values) {
            if (value != null && !value.isEmpty()) {
                return value;
            }
        }
        return List.of();
    }
}
