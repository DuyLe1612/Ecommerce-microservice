package com.example.search.infrastructure.client.dto;

import lombok.Data;

@Data
public class BrandSummaryResponse {
    private Long id;
    private String name;
    private String slug;
    private String logoUrl;
}
