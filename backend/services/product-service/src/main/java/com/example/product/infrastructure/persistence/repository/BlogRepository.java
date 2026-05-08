package com.example.product.infrastructure.persistence.repository;

import com.example.product.infrastructure.persistence.entity.BlogJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BlogRepository extends JpaRepository<BlogJpaEntity, Long> {
    Optional<BlogJpaEntity> findBySlug(String slug);
    List<BlogJpaEntity> findTop10ByStatusOrderByPublishedAtDesc(String status);
    List<BlogJpaEntity> findTop5ByStatusAndIdNotOrderByPublishedAtDesc(String status, Long id);
    List<BlogJpaEntity> findTop5ByStatusAndTagsContainingIgnoreCaseOrderByPublishedAtDesc(String status, String tag);
    List<BlogJpaEntity> findTop10ByStatusAndTagsContainingIgnoreCaseOrderByPublishedAtDesc(String status, String tag);
}
