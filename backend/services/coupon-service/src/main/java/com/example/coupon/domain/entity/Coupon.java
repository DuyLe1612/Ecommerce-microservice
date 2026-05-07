package com.example.coupon.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "coupons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "\"Id\"")
    private Integer id;

    @Column(name = "\"Code\"", nullable = false, length = 50, unique = true)
    private String code;

    @Column(name = "\"Name\"", nullable = false, length = 200)
    private String name;

    @Column(name = "\"Type\"", nullable = false, length = 20)
    private String type; // e.g. PERCENTAGE, FIXED_AMOUNT

    @Column(name = "\"Value\"", nullable = false, precision = 12, scale = 2)
    private BigDecimal value;

    @Column(name = "\"Quantity\"", nullable = false)
    private Integer quantity;

    @Column(name = "\"UsedCount\"", nullable = false)
    private Integer usedCount;

    @Column(name = "\"MaxUsagePerUser\"")
    private Integer maxUsagePerUser;

    @Column(name = "\"MinPurchaseAmount\"", precision = 12, scale = 2)
    private BigDecimal minPurchaseAmount;

    @Column(name = "\"MaxDiscountAmount\"", precision = 12, scale = 2)
    private BigDecimal maxDiscountAmount;

    @Column(name = "\"StartDate\"", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "\"EndDate\"", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "\"Status\"", nullable = false, length = 20)
    private String status; // e.g. Active, Inactive

    @Column(name = "\"Note\"", length = 500)
    private String note;

    @Column(name = "\"CreatedAt\"", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "\"UpdatedAt\"", nullable = false)
    private LocalDateTime updatedAt;

    @ElementCollection
    @CollectionTable(name = "coupon_products", joinColumns = @JoinColumn(name = "\"CouponId\""))
    @Column(name = "\"ProductId\"")
    private Set<Integer> productIds = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "coupon_categories", joinColumns = @JoinColumn(name = "\"CouponId\""))
    @Column(name = "\"CategoryId\"")
    private Set<Integer> categoryIds = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (this.createdAt == null) this.createdAt = now;
        if (this.updatedAt == null) this.updatedAt = now;
        if (this.usedCount == null) this.usedCount = 0;
        if (this.status == null) this.status = "Active";
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
