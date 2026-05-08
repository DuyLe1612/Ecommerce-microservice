package com.example.product.application.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductVariantRequest {
    private Long productId;
    private String sku;
    private BigDecimal price;
    private Integer stock;
    private String status;
}
