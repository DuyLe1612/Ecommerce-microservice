package com.uit.paymentservice.infrastructure.external;

public interface AuthServiceClient {

    record AuthResult(String userId, String email, String role) {}

    /**
     * Validate the bearer token and return the authenticated user.
     * In mock mode: parses "mock-user-{userId}-{role}" or any plain userId string.
     * In real mode: validates JWT against auth-service.
     */
    AuthResult validateTokenAndGetUser(String bearerToken);

    class AuthenticationException extends RuntimeException {
        public AuthenticationException(String message) {
            super(message);
        }
    }
}
