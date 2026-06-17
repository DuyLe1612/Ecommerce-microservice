package com.example.product.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_variant")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariantJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "\"Id\"")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"ProductId\"", nullable = false)
    @JsonIgnoreProperties({"variants", "images"})
    private ProductJpaEntity product;

    @Column(name = "\"Sku\"", nullable = false, length = 100, unique = true)
    private String sku;

    @Column(name = "\"Price\"", nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Builder.Default
    @Column(name = "\"Stock\"", nullable = false)
    private Integer stock = 0;

    @Column(name = "\"Status\"", nullable = false, columnDefinition = "text")
    private String status;

    @CreationTimestamp
    @Column(name = "\"CreatedAt\"", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
