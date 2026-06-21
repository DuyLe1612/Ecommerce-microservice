package com.example.product.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "\"blog_post_tags\"")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogPostTagJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "\"Id\"")
    private Long id;

    @Column(name = "\"BlogPostId\"", nullable = false)
    private Long blogPostId;

    @Column(name = "\"Tag\"", nullable = false, length = 50)
    private String tag;
}
