package com.example.product.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "\"attribute_value\"")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttributeValueJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "\"Id\"")
    private Long id;

    @Column(name = "\"AttributeId\"", nullable = false)
    private Long attributeId;

    @Column(name = "\"Value\"", nullable = false, length = 100)
    private String value;
}
