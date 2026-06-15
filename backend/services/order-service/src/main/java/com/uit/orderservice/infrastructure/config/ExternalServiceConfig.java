package com.uit.orderservice.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration properties for external service clients.
 * Maps to the order.external.* prefix in application.yaml.
 */
@ConfigurationProperties(prefix = "order.external")
public class ExternalServiceConfig {

    private Product product = new Product();

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public static class Product {
        private String mode = "mock";
        private String baseUrl = "http://localhost:8080";
        private int connectTimeoutMs = 3000;
        private int readTimeoutMs = 5000;

        public String getMode() { return mode; }
        public void setMode(String mode) { this.mode = mode; }
        public String getBaseUrl() { return baseUrl; }
        public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }
        public int getConnectTimeoutMs() { return connectTimeoutMs; }
        public void setConnectTimeoutMs(int connectTimeoutMs) { this.connectTimeoutMs = connectTimeoutMs; }
        public int getReadTimeoutMs() { return readTimeoutMs; }
        public void setReadTimeoutMs(int readTimeoutMs) { this.readTimeoutMs = readTimeoutMs; }
    }
}
