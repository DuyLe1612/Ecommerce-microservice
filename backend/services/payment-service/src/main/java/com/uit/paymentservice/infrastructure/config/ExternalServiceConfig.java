package com.uit.paymentservice.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "payment.external")
public class ExternalServiceConfig {

    private AuthConfig auth = new AuthConfig();
    private OrderConfig order = new OrderConfig();

    public AuthConfig auth() {
        return auth;
    }

    public void setAuth(AuthConfig auth) {
        this.auth = auth;
    }

    public OrderConfig order() {
        return order;
    }

    public void setOrder(OrderConfig order) {
        this.order = order;
    }

    public static class AuthConfig {
        private String mode = "mock";
        private String baseUrl = "http://auth-service:8081";
        private String jwtSecret;

        public String mode() {
            return mode;
        }

        public void setMode(String mode) {
            this.mode = mode;
        }

        public String baseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
        }

        public String jwtSecret() {
            return jwtSecret;
        }

        public void setJwtSecret(String jwtSecret) {
            this.jwtSecret = jwtSecret;
        }
    }

    public static class OrderConfig {
        private String mode = "mock";
        private String baseUrl = "http://order-service:8082";

        public String mode() {
            return mode;
        }

        public void setMode(String mode) {
            this.mode = mode;
        }

        public String baseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
        }
    }
}
