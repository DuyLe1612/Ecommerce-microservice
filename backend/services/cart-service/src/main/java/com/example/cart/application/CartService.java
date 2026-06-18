package com.example.cart.application;

import com.example.cart.application.dto.CartItem;
import com.example.cart.application.dto.CartResponse;
import com.example.cart.domain.Cart;
import com.example.cart.infrastructure.product.ProductClient;
import java.math.BigDecimal;
import java.time.Duration;
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

    public CartResponse getCart(Long userId) {
        return toResponse(userId, cartStore.get(userId));
    }

    public CartResponse addItem(Long userId, Long variantId, int quantity) {
        ProductClient.VariantInfo variant = productClient.getVariant(variantId);
        Cart cart = cartStore.get(userId);
        cart.upsert(new CartItem(
            variantId,
            variant.productId(),
            variant.name(),
            variant.price(),
            variant.currency(),
            quantity
        ));
        cartStore.save(userId, cart, Duration.ofDays(ttlDays));
        return toResponse(userId, cart);
    }

    public CartResponse updateItem(Long userId, Long variantId, int quantity) {
        ProductClient.VariantInfo variant = productClient.getVariant(variantId);
        Cart cart = cartStore.get(userId);
        cart.upsert(new CartItem(
            variantId,
            variant.productId(),
            variant.name(),
            variant.price(),
            variant.currency(),
            quantity
        ));
        cartStore.save(userId, cart, Duration.ofDays(ttlDays));
        return toResponse(userId, cart);
    }

    public CartResponse removeItem(Long userId, Long variantId) {
        Cart cart = cartStore.get(userId);
        cart.remove(variantId);
        cartStore.save(userId, cart, Duration.ofDays(ttlDays));
        return toResponse(userId, cart);
    }

    public void clear(Long userId) {
        cartStore.delete(userId);
    }

    public CartResponse snapshot(Long userId) {
        return getCart(userId);
    }

    private CartResponse toResponse(Long userId, Cart cart) {
        BigDecimal subtotal = cart.getItems().stream()
            .map(item -> item.price().multiply(BigDecimal.valueOf(item.quantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        String currency = cart.getItems().stream()
            .findFirst()
            .map(CartItem::currency)
            .orElse("VND");
        return new CartResponse(userId, cart.getItems(), subtotal, currency);
    }
}
