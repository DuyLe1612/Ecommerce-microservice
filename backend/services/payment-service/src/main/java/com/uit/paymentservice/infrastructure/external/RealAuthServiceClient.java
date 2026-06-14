package com.uit.paymentservice.infrastructure.external;

import com.uit.paymentservice.infrastructure.config.ExternalServiceConfig;
import java.time.Duration;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@ConditionalOnProperty(name = "payment.external.auth.mode", havingValue = "real")
public class RealAuthServiceClient implements AuthServiceClient {

    private static final Logger log = LoggerFactory.getLogger(RealAuthServiceClient.class);
    private final WebClient webClient;
    private final ExternalServiceConfig config;

    public RealAuthServiceClient(WebClient.Builder webClientBuilder, ExternalServiceConfig config) {
        this.config = config;
        this.webClient = webClientBuilder
            .baseUrl(config.auth().baseUrl())
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .build();
    }

    @Override
    public AuthResult validateTokenAndGetUser(String bearerToken) {
        try {
            log.debug("Calling auth-service to validate token");

            Map<String, Object> response = webClient.get()
                .uri("/api/auth/validate")
                .header(HttpHeaders.AUTHORIZATION, bearerToken)
                .retrieve()
                .bodyToMono(Map.class)
                .block(Duration.ofSeconds(5));

            Long userId = Long.valueOf(response.get("userId").toString());
            String email = (String) response.get("email");
            String role = (String) response.get("role");

            log.debug("Auth service validation success: userId={}, role={}", userId, role);
            return new AuthResult(userId, email, role);
        } catch (Exception ex) {
            log.error("Auth service unavailable: {}", ex.getMessage());
            throw new AuthServiceUnavailableException("Auth service unavailable: " + ex.getMessage());
        }
    }

    public static class AuthServiceUnavailableException extends RuntimeException {
        public AuthServiceUnavailableException(String message) {
            super(message);
        }
    }
}
