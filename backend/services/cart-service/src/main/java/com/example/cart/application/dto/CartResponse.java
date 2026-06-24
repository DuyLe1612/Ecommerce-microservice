package com.example.cart.application.dto;

import java.math.BigDecimal;
import java.util.List;

public record CartResponse(
    String userId,
    List<CartItem> items,
    BigDecimal subtotal,
    String currency,
    int totalItems
) {}
