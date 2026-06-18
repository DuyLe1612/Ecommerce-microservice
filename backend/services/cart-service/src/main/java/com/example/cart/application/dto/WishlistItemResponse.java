package com.example.cart.application.dto;

import java.time.LocalDateTime;

public record WishlistItemResponse(Long productId, LocalDateTime createdAt) {}
