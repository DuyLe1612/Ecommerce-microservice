package com.example.search.application.query;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchProductsQuery {
    private String q;
    private String categoryId;
    private String brandId;
    private Double minPrice;
    private Double maxPrice;
    private String status;
    private int page;
    private int size;
}
