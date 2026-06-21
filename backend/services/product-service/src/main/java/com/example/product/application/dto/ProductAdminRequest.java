package com.example.product.application.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
public class ProductAdminRequest {
    private String name;
    private String slug;
    private Long categoryId;
    private Long brandId;
    private BigDecimal basePrice;
    private String description;
    private String status;
    private java.math.BigDecimal discountPercent;
    private String overview;
    private Map<String, Object> specs;
}
