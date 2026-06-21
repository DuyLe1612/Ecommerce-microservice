package com.example.product.infrastructure.seed;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class ProductSeedRecord {
    @JsonProperty("Id")
    private Long id;
    
    @JsonProperty("CategoryId")
    private Long categoryId;
    
    @JsonProperty("BrandId")
    private Long brandId;
    
    @JsonProperty("Name")
    private String name;
    
    @JsonProperty("Slug")
    private String slug;
    
    @JsonProperty("DiscountPercent")
    private BigDecimal discountPercent;
    
    @JsonProperty("Status")
    private String status;
    
    @JsonProperty("BasePrice")
    private BigDecimal basePrice;
    
    @JsonProperty("Description")
    private String description;
    
    @JsonProperty("Overview")
    private String overview;
    
    @JsonProperty("Specs")
    private List<Spec> specs;
    
    @JsonProperty("TotalSold")
    private Integer totalSold;

    @Data
    public static class Spec {
        @JsonProperty("Name")
        private String name;
        
        @JsonProperty("Value")
        private List<String> value;
    }
}
