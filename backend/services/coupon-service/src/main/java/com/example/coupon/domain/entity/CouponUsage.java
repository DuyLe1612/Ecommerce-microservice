package com.example.coupon.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupon_usages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "\"Id\"")
    private Integer id;

    @Column(name = "\"CouponId\"", nullable = false)
    private Integer couponId;

    @Column(name = "\"OrderId\"", nullable = false)
    private Integer orderId;

    @Column(name = "\"UserId\"", nullable = false)
    private Integer userId;

    @Column(name = "\"DiscountAmount\"", nullable = false, precision = 12, scale = 2)
    private BigDecimal discountAmount;

    @Column(name = "\"TotalOrderAmount\"", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalOrderAmount;

    @Column(name = "\"UsedAt\"", nullable = false, updatable = false)
    private LocalDateTime usedAt;

    @PrePersist
    protected void onCreate() {
        if (this.usedAt == null) {
            this.usedAt = LocalDateTime.now();
        }
    }
}
