package com.example.product.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "\"blog_posts\"")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "\"Id\"")
    private Long id;

    @Column(name = "\"Title\"", nullable = false, length = 200)
    private String title;

    @Column(name = "\"Slug\"", nullable = false, unique = true, length = 200)
    private String slug;

    @Column(name = "\"Summary\"", nullable = false, length = 500)
    private String summary;

    @Column(name = "\"Content\"", nullable = false, columnDefinition = "text")
    private String content;

    @Column(name = "\"FeaturedImageUrl\"", nullable = false, length = 500)
    private String featuredImageUrl;

    @Column(name = "\"AuthorId\"", nullable = false)
    private Long authorId;

    @Column(name = "\"Status\"", nullable = false, length = 20)
    private String status;

    @Column(name = "\"ViewCount\"", nullable = false)
    @Builder.Default
    private Integer viewCount = 0;

    @Column(name = "\"PublishedAt\"", nullable = true)
    private LocalDateTime publishedAt;

    @CreationTimestamp
    @Column(name = "\"CreatedAt\"", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "\"UpdatedAt\"")
    private LocalDateTime updatedAt;

    @Column(name = "\"ProductIds\"", nullable = false, columnDefinition = "text")
    @Builder.Default
    private String productIds = "[]";
}
