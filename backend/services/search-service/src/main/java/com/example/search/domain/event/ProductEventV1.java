package com.example.search.domain.event;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ProductEventV1 {
    private String eventVersion;
    private String eventType;
    private Long productId;
    private String slug;
    private String name;
    private BigDecimal basePrice;
    private Long categoryId;
    private Long brandId;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
