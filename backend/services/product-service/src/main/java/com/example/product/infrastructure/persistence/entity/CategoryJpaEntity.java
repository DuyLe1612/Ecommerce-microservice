package com.example.product.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "\"category\"")
@Data
public class CategoryJpaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "\"Id\"")
    private Long id;

    @Column(name = "\"Name\"", nullable = false, length = 100)
    private String name;

    @Column(name = "\"Slug\"", nullable = false, unique = true, length = 120)
    private String slug;

    @Column(name = "\"IconPath\"", nullable = false, length = 255)
    private String iconPath;

    @Column(name = "\"ImageUrl\"", length = 500)
    private String imageUrl;

    @Column(name = "\"ParentId\"")
    private Long parentId;

    @Column(name = "\"Description\"", columnDefinition = "text")
    private String description;

    @Column(name = "\"CreatedAt\"", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "\"UpdatedAt\"", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (iconPath == null) {
            iconPath = "...";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
