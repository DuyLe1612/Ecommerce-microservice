package com.example.product.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "product_attribute")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductAttributeJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "\"Id\"")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"ProductId\"", nullable = false)
    @JsonIgnoreProperties({"variants", "images"})
    private ProductJpaEntity product;

    @Column(name = "\"Name\"", nullable = false, length = 100)
    private String name;

    @Column(name = "\"Value\"", columnDefinition = "text")
    private String value;
}
