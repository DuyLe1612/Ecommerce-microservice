package com.example.product.domain.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
