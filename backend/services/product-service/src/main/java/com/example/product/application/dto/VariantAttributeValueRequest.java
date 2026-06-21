package com.example.product.application.dto;

import lombok.Data;

@Data
public class VariantAttributeValueRequest {
    private Long attributeId;
    private Long valueId;
}
