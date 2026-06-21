package com.example.product.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "\"product_attribute\"")
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

    @Column(name = "\"Name\"", nullable = false, length = 100)
    private String name;

    @Column(name = "\"InputType\"", nullable = false, length = 50)
    private String inputType;

    @Column(name = "\"IsGlobal\"", nullable = false)
    private Boolean isGlobal;

    @Column(name = "\"CreatedAt\"", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "\"CategoryId\"")
    private Long categoryId;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (inputType == null) {
            inputType = "select";
        }
        if (isGlobal == null) {
            isGlobal = false;
        }
    }
}
