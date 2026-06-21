package com.example.product.infrastructure.persistence.repository;

import com.example.product.infrastructure.persistence.entity.BlogPostTagJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlogPostTagRepository extends JpaRepository<BlogPostTagJpaEntity, Long> {
    List<BlogPostTagJpaEntity> findByBlogPostId(Long blogPostId);
    void deleteByBlogPostId(Long blogPostId);
}
