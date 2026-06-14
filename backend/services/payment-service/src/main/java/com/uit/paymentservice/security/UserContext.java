package com.uit.paymentservice.security;

public record UserContext(Long userId, String email, String role) {}
