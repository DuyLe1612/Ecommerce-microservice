package com.example.product.application.dto;

import lombok.Data;

@Data
public class BrandSummaryResponse {
    private Long id;
    private String name;
    private String slug;
    private String logoUrl;
}
