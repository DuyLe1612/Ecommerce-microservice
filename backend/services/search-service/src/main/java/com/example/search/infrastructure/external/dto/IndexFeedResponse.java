package com.example.search.infrastructure.external.dto;

import lombok.Data;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
public class IndexFeedResponse {
    private List<ProductFeedDto> content;
    private int totalPages;
    private long totalElements;

    @Data
    public static class ProductFeedDto {
        private String id;
        private String slug;
        private String name;
        private String categoryId;
        private String categoryName;
        private String brandId;
        private String brandName;
        private Double basePrice;
        private Double minVariantPrice;
        private Double discountPercent;
        private String status;
        private com.fasterxml.jackson.databind.JsonNode specs;
        private Float averageRating;
        private Integer totalReviews;
        private java.time.LocalDateTime createdAt;
        private java.time.LocalDateTime updatedAt;
        private String primaryImageUrl;
    }
}
