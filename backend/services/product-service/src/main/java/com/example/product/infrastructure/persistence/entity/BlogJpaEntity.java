package com.example.product.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "blog_post")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, unique = true, length = 220)
    private String slug;

    @Column(columnDefinition = "text")
    private String summary;

    @Column(columnDefinition = "text")
    private String content;

    @Column(columnDefinition = "text")
    private String tags;

    @Column(nullable = false, length = 20)
    private String status;

    private LocalDateTime publishedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
