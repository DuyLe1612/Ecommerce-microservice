package com.example.product.application.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ProductAdminSummaryResponse {
    private Long id;
    private String name;
    private String slug;
    private BigDecimal basePrice;
    private BigDecimal minVariantPrice;
    private String status;
    private Long categoryId;
    private String categoryName;
    private Long brandId;
    private String brandName;
    private String primaryImageUrl;
    private int variantCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
