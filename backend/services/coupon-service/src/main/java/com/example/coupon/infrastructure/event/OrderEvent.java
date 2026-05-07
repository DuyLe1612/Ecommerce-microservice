package com.example.coupon.infrastructure.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderEvent {
    private String eventId;
    private String eventType; // e.g. "OrderCompleted"
    private Integer orderId;
    private Integer userId;
    private String couponCode;
    private BigDecimal totalOrderAmount;
    private BigDecimal discountAmount;
}
