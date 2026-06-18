package com.example.cart.application.dto;

import java.math.BigDecimal;
import java.util.List;

public record CartResponse(
    Long userId,
    List<CartItem> items,
    BigDecimal subtotal,
    String currency
) {}
