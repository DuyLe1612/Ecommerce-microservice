package com.uit.paymentservice.infrastructure.external;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Mock AuthServiceClient — active until auth-service is production-ready.
 *
 * Accepts: "mock-user-{userId}-{role}" or a plain numeric userId string.
 * To migrate: implement RealAuthServiceClient and set payment.external.auth.mode=real.
 */
@Component
@ConditionalOnProperty(
    name = "payment.external.auth.mode",
    havingValue = "mock",
    matchIfMissing = true
)
public class MockAuthServiceClient implements AuthServiceClient {

    private static final Logger log = LoggerFactory.getLogger(MockAuthServiceClient.class);
    private static final Pattern MOCK_TOKEN = Pattern.compile("mock-user-(\\d+)-(\\w+)");

    @Override
    public AuthResult validateTokenAndGetUser(String bearerToken) {
        if (bearerToken == null || bearerToken.isBlank()) {
            throw new AuthenticationException("No token provided");
        }

        // Strip "Bearer " prefix if present
        String token = bearerToken.startsWith("Bearer ")
            ? bearerToken.substring(7)
            : bearerToken;

        // Case 1: mock-user-{id}-{role} format
        Matcher m = MOCK_TOKEN.matcher(token);
        if (m.matches()) {
            Long userId = Long.parseLong(m.group(1));
            String role = m.group(2).toUpperCase();
            log.debug("Mock auth: userId={}, role={}", userId, role);
            return new AuthResult(userId, "mock-" + userId + "@example.com", role);
        }

        // Case 2: plain numeric userId (sent via X-User-Id header proxy)
        try {
            Long userId = Long.parseLong(token.trim());
            log.debug("Mock auth via numeric userId={}", userId);
            return new AuthResult(userId, "user-" + userId + "@example.com", "CUSTOMER");
        } catch (NumberFormatException ignored) {
            // Not a numeric token
        }

        throw new AuthenticationException("Invalid mock token format: " + token);
    }
}
