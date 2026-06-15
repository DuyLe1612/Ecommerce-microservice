package com.uit.orderservice.domain.model;

import java.math.BigDecimal;

public record OrderItem(
    Long productId,
    String productName,
    int quantity,
    BigDecimal unitPrice,
    BigDecimal subtotal
) {}
