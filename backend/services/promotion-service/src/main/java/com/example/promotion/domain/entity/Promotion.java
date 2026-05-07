package com.example.promotion.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "\"Promotions\"")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "\"Id\"")
    private Integer id;

    @Column(name = "\"Name\"", nullable = false, length = 200)
    private String name;

    @Column(name = "\"Description\"", length = 1000)
    private String description;

    @Column(name = "\"Type\"", nullable = false)
    private Integer type; // e.g. 1: PERCENTAGE, 2: FIXED_AMOUNT

    @Column(name = "\"Value\"", nullable = false, precision = 18, scale = 2)
    private BigDecimal value;

    @Column(name = "\"StartDate\"", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "\"EndDate\"", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "\"Status\"", nullable = false)
    private Integer status; // e.g. 1: ACTIVE, 0: PAUSED

    @Column(name = "\"Priority\"", nullable = false)
    private Integer priority;

    @Column(name = "\"StackableWithCoupons\"", nullable = false)
    private Boolean stackableWithCoupons;

    @Column(name = "\"CreatedAt\"", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "\"UpdatedAt\"", nullable = false)
    private LocalDateTime updatedAt;

    @ElementCollection
    @CollectionTable(name = "\"PromotionProducts\"", joinColumns = @JoinColumn(name = "\"PromotionId\""))
    @Column(name = "\"ProductId\"")
    private Set<Integer> productIds = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "\"PromotionCategories\"", joinColumns = @JoinColumn(name = "\"PromotionId\""))
    @Column(name = "\"CategoryId\"")
    private Set<Integer> categoryIds = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (this.createdAt == null) this.createdAt = now;
        if (this.updatedAt == null) this.updatedAt = now;
        if (this.priority == null) this.priority = 0;
        if (this.stackableWithCoupons == null) this.stackableWithCoupons = true;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
