package com.example.product.application.dto;

import lombok.Data;

@Data
public class BrandRequest {
    private String name;
    private String slug;
    private String logoUrl;
}
