package com.example.coupon.presentation.dto;

import com.example.coupon.domain.entity.Coupon;
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
public class CouponResponse {
    private Integer id;
    private String code;
    private String name;
    private String type;
    private BigDecimal value;
    private Integer quantity;
    private Integer usedCount;
    private Integer maxUsagePerUser;
    private BigDecimal minPurchaseAmount;
    private BigDecimal maxDiscountAmount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String status;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Set<Integer> productIds;
    private Set<Integer> categoryIds;

    public static CouponResponse fromEntity(Coupon coupon) {
        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .name(coupon.getName())
                .type(coupon.getType())
                .value(coupon.getValue())
                .quantity(coupon.getQuantity())
                .usedCount(coupon.getUsedCount())
                .maxUsagePerUser(coupon.getMaxUsagePerUser())
                .minPurchaseAmount(coupon.getMinPurchaseAmount())
                .maxDiscountAmount(coupon.getMaxDiscountAmount())
                .startDate(coupon.getStartDate())
                .endDate(coupon.getEndDate())
                .status(coupon.getStatus())
                .note(coupon.getNote())
                .createdAt(coupon.getCreatedAt())
                .updatedAt(coupon.getUpdatedAt())
                .productIds(coupon.getProductIds())
                .categoryIds(coupon.getCategoryIds())
                .build();
    }
}
