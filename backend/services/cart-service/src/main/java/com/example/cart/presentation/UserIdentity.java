package com.example.cart.presentation;

import org.springframework.stereotype.Component;

@Component
public class UserIdentity {
    public Long resolve(String authHeader, Long xUserId) {
        if (authHeader != null && authHeader.startsWith("Bearer mock-user-")) {
            try {
                String[] parts = authHeader.substring(7).split("-");
                if (parts.length >= 4) {
                    return Long.parseLong(parts[2]);
                }
            } catch (NumberFormatException ignored) {
            }
        }
        return xUserId;
    }
}
