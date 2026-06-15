package com.uit.orderservice.infrastructure.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

/**
 * Configuration for external service WebClient beans.
 * Creates a dedicated WebClient for each external service.
 */
@Configuration
@EnableConfigurationProperties(ExternalServiceConfig.class)
public class ExternalServiceConfigConfiguration {

    @Bean("productServiceWebClient")
    public WebClient productServiceWebClient(ExternalServiceConfig config) {
        ExternalServiceConfig.Product productConfig = config.getProduct();

        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofMillis(productConfig.getReadTimeoutMs()))
                .followRedirect(false);

        return WebClient.builder()
                .baseUrl(productConfig.getBaseUrl())
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(1024 * 512))
                .build();
    }
}
