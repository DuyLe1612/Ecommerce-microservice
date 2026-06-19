package com.example.cart.application.dto;

import java.math.BigDecimal;

public record CartItem(
    Long variantId,
    Integer productId,
    String name,
    BigDecimal price,
    String currency,
    int quantity
) {}
