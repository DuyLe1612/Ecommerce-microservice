package com.example.search.infrastructure.client.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProductDetailResponse {
    private String name;
    private String slug;
    private Double basePrice;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private CategorySummaryResponse category;
    private BrandSummaryResponse brand;
}
