package com.example.coupon.presentation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidateCouponRequest {
    private String code;
    private Integer userId;
    private BigDecimal totalOrderAmount;
    private List<Item> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Item {
        private Integer productId;
        private Integer categoryId;
        private BigDecimal price;
        private Integer quantity;
    }
}
