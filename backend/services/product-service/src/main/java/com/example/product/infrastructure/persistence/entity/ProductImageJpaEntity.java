package com.example.product.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_image")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImageJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "\"Id\"")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"ProductId\"", nullable = false)
    private ProductJpaEntity product;

    @Column(name = "\"ImageUrl\"", nullable = false, columnDefinition = "text")
    private String imageUrl;

    @Column(name = "\"PublicId\"", columnDefinition = "text")
    private String publicId;

    @Builder.Default
    @Column(name = "\"IsPrimary\"", nullable = false)
    private Boolean isPrimary = false;

    @Builder.Default
    @Column(name = "\"SortOrder\"", nullable = false)
    private Integer sortOrder = 0;
}
