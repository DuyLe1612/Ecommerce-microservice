package com.example.product.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "\"brand\"")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrandJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "\"Id\"")
    private Long id;

    @Column(name = "\"Name\"", nullable = false, length = 100)
    private String name;

    @Column(name = "\"Slug\"", nullable = false, unique = true, length = 120)
    private String slug;

    @Column(name = "\"Country\"", length = 50)
    private String country;

    @Column(name = "\"LogoPath\"", length = 255)
    private String logoPath;

    @CreationTimestamp
    @Column(name = "\"CreatedAt\"", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "\"UpdatedAt\"", nullable = false)
    private LocalDateTime updatedAt;
}
