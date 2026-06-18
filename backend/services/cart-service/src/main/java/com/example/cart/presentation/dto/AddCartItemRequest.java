package com.example.cart.presentation.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AddCartItemRequest(
    @NotNull Long variantId,
    @Min(1) int quantity
) {}
