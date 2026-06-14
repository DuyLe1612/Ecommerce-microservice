package com.uit.paymentservice.infrastructure.external;

public interface AuthServiceClient {

    record AuthResult(Long userId, String email, String role) {}

    AuthResult validateTokenAndGetUser(String bearerToken);
}
