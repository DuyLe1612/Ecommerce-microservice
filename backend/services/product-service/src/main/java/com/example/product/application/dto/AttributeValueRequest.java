package com.example.product.application.dto;

import lombok.Data;

@Data
public class AttributeValueRequest {
    private Long attributeId;
    private String value;
    private String valuesCsv; // for bulk update
}
