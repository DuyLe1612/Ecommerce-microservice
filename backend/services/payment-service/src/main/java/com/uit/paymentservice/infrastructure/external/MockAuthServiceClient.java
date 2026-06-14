package com.uit.paymentservice.infrastructure.external;

import com.uit.paymentservice.infrastructure.config.ExternalServiceConfig;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "payment.external.auth.mode", havingValue = "mock", matchIfMissing = true)
public class MockAuthServiceClient implements AuthServiceClient {

    private static final Logger log = LoggerFactory.getLogger(MockAuthServiceClient.class);
    private static final Pattern MOCK_TOKEN_PATTERN = Pattern.compile("mock-user-(\\d+)-(\\w+)");

    @Override
    public AuthResult validateTokenAndGetUser(String bearerToken) {
        if (bearerToken == null || bearerToken.isBlank()) {
            throw new AuthenticationException("Bearer token is required");
        }

        String token = bearerToken.trim();
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        if (!token.startsWith("mock-user-")) {
            throw new AuthenticationException("Invalid mock token format. Expected: mock-user-{userId}-{role}");
        }

        Matcher matcher = MOCK_TOKEN_PATTERN.matcher(token);
        if (!matcher.matches()) {
            throw new AuthenticationException("Invalid mock token format");
        }

        Long userId = Long.parseLong(matcher.group(1));
        String role = matcher.group(2);
        String email = "mock-" + userId + "@example.com";

        log.debug("Mock auth: userId={}, role={}", userId, role);
        return new AuthResult(userId, email, role);
    }

    public static class AuthenticationException extends RuntimeException {
        public AuthenticationException(String message) {
            super(message);
        }
    }
}
