package com.example.cart.presentation.dto;

import jakarta.validation.constraints.NotNull;

public record AddWishlistItemRequest(@NotNull Long productId) {}
