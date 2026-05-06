package com.example.search.infrastructure.client.dto;

import lombok.Data;

@Data
public class CategorySummaryResponse {
    private Long id;
    private String name;
    private String slug;
}
