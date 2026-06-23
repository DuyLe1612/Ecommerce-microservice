package com.example.product.application.dto;

import lombok.Data;

@Data
public class ProductListItemResponse {
    private Long id;
    private String name;
    private String slug;
    private java.math.BigDecimal basePrice;
    private java.math.BigDecimal discountPercent;
    private String primaryImageUrl;
    private String brandName;
    private String categoryName;
    private Double averageRating;
    private String status;
}
