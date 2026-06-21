package com.example.product.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "\"product_variant_attribute\"")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(ProductVariantAttributeJpaEntity.ProductVariantAttributeId.class)
public class ProductVariantAttributeJpaEntity {

    @Id
    @Column(name = "\"VariantId\"")
    private Long variantId;

    @Id
    @Column(name = "\"AttributeId\"")
    private Long attributeId;

    @Column(name = "\"ValueId\"", nullable = false)
    private Long valueId;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class ProductVariantAttributeId implements Serializable {
        private Long variantId;
        private Long attributeId;
    }
}
