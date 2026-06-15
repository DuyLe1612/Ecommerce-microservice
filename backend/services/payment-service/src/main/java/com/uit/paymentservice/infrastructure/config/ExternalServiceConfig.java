package com.uit.paymentservice.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration for external service endpoints (order-service, etc.).
 */
@Component
@ConfigurationProperties(prefix = "payment.external")
public class ExternalServiceConfig {

    private OrderConfig order = new OrderConfig();

    public OrderConfig order() {
        return order;
    }

    public void setOrder(OrderConfig order) {
        this.order = order;
    }

    public static class OrderConfig {
        private String baseUrl = "http://order-service:8087";
        private int connectTimeoutMs = 3000;
        private int readTimeoutMs = 5000;

        public String baseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
        }

        public int connectTimeoutMs() {
            return connectTimeoutMs;
        }

        public void setConnectTimeoutMs(int connectTimeoutMs) {
            this.connectTimeoutMs = connectTimeoutMs;
        }

        public int readTimeoutMs() {
            return readTimeoutMs;
        }

        public void setReadTimeoutMs(int readTimeoutMs) {
            this.readTimeoutMs = readTimeoutMs;
        }
    }
}
