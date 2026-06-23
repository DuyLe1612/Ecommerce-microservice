package com.example.search.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDocument {
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
    private Instant createdAt;
    private Instant updatedAt;
    private String primaryImageUrl;
}
