package com.example.product.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "product")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "\"Id\"")
    private Long id;

    @Column(name = "\"CategoryId\"", nullable = false)
    private Long categoryId;

    @Column(name = "\"BrandId\"", nullable = false)
    private Long brandId;

    @Column(name = "\"Name\"", nullable = false, length = 150)
    private String name;

    @Column(name = "\"Slug\"", nullable = false, length = 200, unique = true)
    private String slug;

    @Column(name = "\"DiscountPercent\"")
    private BigDecimal discountPercent;

    @Column(name = "\"Status\"", nullable = false, length = 50)
    private String status;

    @Column(name = "\"BasePrice\"", nullable = false, precision = 18, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "\"Description\"", columnDefinition = "text")
    private String description;

    @Column(name = "\"Overview\"", columnDefinition = "text")
    private String overview;

    @Column(name = "\"TotalSold\"", nullable = false)
    private Integer totalSold = 0;

    @Column(name = "\"AverageRating\"", nullable = false)
    private Double averageRating = 0.0;

    @Column(name = "\"TotalReviews\"", nullable = false)
    private Integer totalReviews = 0;

    @CreationTimestamp
    @Column(name = "\"CreatedAt\"", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "\"UpdatedAt\"", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ProductVariantJpaEntity> variants = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ProductImageJpaEntity> images = new ArrayList<>();
}
