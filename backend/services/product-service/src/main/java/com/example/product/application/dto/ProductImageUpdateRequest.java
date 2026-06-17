package com.example.product.application.dto;

import lombok.Data;

@Data
public class ProductImageUpdateRequest {
    private Boolean isPrimary;
    private Integer sortOrder;
}
