package com.example.search.infrastructure.external;

import com.example.search.application.dto.ApiResponse;
import com.example.search.infrastructure.external.dto.IndexFeedResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@Slf4j
public class RestProductServiceClient implements ProductServiceClient {

    private final WebClient webClient;
    private final String baseUrl;

    public RestProductServiceClient(WebClient.Builder webClientBuilder, @Value("${product-service.url:http://localhost:8082}") String baseUrl) {
        this.baseUrl = baseUrl;
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
    }

    @Override
    public IndexFeedResponse getIndexFeed(int page, int size, String updatedAfter) {
        String url = "/internal/products/index-feed?page=" + page + "&size=" + size;
        if (updatedAfter != null) {
            url += "&updatedAfter=" + updatedAfter;
        }
        
        try {
            return webClient.get()
                .uri(url)
                .retrieve()
                .bodyToMono(IndexFeedResponse.class)
                .block();
        } catch (Exception e) {
            log.error("Failed to fetch index feed from product-service", e);
            return null;
        }
    }

    @Override
    public IndexFeedResponse.ProductFeedDto getProductBySlug(String slug) {
        try {
            ApiResponse<IndexFeedResponse.ProductFeedDto> response = webClient.get()
                .uri("/internal/products/" + slug)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<ApiResponse<IndexFeedResponse.ProductFeedDto>>() {})
                .block();
                
            return response != null ? response.getData() : null;
        } catch (Exception e) {
            log.error("Failed to fetch product by slug: " + slug, e);
            return null;
        }
    }
}
