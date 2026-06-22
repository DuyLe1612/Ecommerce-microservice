package com.example.product.infrastructure.persistence.repository;

import com.example.product.infrastructure.persistence.entity.BlogJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BlogRepository extends JpaRepository<BlogJpaEntity, Long> {
    Optional<BlogJpaEntity> findBySlug(String slug);
    List<BlogJpaEntity> findTop10ByStatusOrderByPublishedAtDesc(String status);
    List<BlogJpaEntity> findTop5ByStatusAndIdNotOrderByPublishedAtDesc(String status, Long id);
    List<BlogJpaEntity> findAllByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    List<BlogJpaEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT b FROM BlogJpaEntity b JOIN BlogPostTagJpaEntity t ON b.id = t.blogPostId WHERE b.status = :status AND LOWER(t.tag) LIKE LOWER(CONCAT('%', :tag, '%')) ORDER BY b.publishedAt DESC")
    List<BlogJpaEntity> findTop5ByStatusAndTagsContainingIgnoreCaseOrderByPublishedAtDesc(@Param("status") String status, @Param("tag") String tag, Pageable pageable);

    @Query("SELECT b FROM BlogJpaEntity b JOIN BlogPostTagJpaEntity t ON b.id = t.blogPostId WHERE b.status = :status AND LOWER(t.tag) LIKE LOWER(CONCAT('%', :tag, '%')) ORDER BY b.publishedAt DESC")
    List<BlogJpaEntity> findTop10ByStatusAndTagsContainingIgnoreCaseOrderByPublishedAtDesc(@Param("status") String status, @Param("tag") String tag, Pageable pageable);
}
