package com.example.product.application.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class ProductDetailResponse {
    private String name;
    private String slug;
    private String description;
    private Double basePrice;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ProductImageResponse> images;
    private List<ProductVariantResponse> variants;
    private CategorySummaryResponse category;
    private BrandSummaryResponse brand;
    private java.math.BigDecimal discountPercent;
    private String overview;
    private Map<String, Object> specs;
    private Double averageRating;
    private Integer totalReviews;
}
