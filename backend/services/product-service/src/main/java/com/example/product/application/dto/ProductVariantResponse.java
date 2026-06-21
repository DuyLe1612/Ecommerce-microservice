package com.example.product.application.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductVariantResponse {
    private Long id;
    private String sku;
    private BigDecimal price;
    private Integer stock;
    private String status;
    private java.util.Map<String, Object> variantSpecsJson;
    private java.util.List<VariantAttributeValueRequest> attributeValues;
}
