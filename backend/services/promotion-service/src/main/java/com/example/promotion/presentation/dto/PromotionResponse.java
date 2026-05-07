package com.example.promotion.presentation.dto;

import com.example.promotion.domain.entity.Promotion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionResponse {
    private Integer id;
    private String name;
    private String description;
    private Integer type;
    private BigDecimal value;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer status;
    private Integer priority;
    private Boolean stackableWithCoupons;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Set<Integer> productIds;
    private Set<Integer> categoryIds;

    public static PromotionResponse fromEntity(Promotion promotion) {
        return PromotionResponse.builder()
                .id(promotion.getId())
                .name(promotion.getName())
                .description(promotion.getDescription())
                .type(promotion.getType())
                .value(promotion.getValue())
                .startDate(promotion.getStartDate())
                .endDate(promotion.getEndDate())
                .status(promotion.getStatus())
                .priority(promotion.getPriority())
                .stackableWithCoupons(promotion.getStackableWithCoupons())
                .createdAt(promotion.getCreatedAt())
                .updatedAt(promotion.getUpdatedAt())
                .productIds(promotion.getProductIds())
                .categoryIds(promotion.getCategoryIds())
                .build();
    }
}
