package com.example.product.application.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class ProductAdminDetailResponse {
    private Long id;
    private String name;
    private String slug;
    private BigDecimal basePrice;
    private String status;
    private String description;
    private Long categoryId;
    private Long brandId;
    private CategorySummaryResponse category;
    private BrandSummaryResponse brand;
    private List<ProductImageResponse> images;
    private List<ProductVariantResponse> variants;
    private java.math.BigDecimal discountPercent;
    private String overview;
    private com.fasterxml.jackson.databind.JsonNode specs;
    private Double averageRating;
    private Integer totalReviews;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
