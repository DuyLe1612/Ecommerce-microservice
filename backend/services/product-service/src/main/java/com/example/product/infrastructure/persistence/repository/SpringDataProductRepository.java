package com.example.product.infrastructure.persistence.repository;

import com.example.product.infrastructure.persistence.entity.ProductJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SpringDataProductRepository extends JpaRepository<ProductJpaEntity, Long> {
    Optional<ProductJpaEntity> findBySlug(String slug);
    
    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, Long id);
    Page<ProductJpaEntity> findAll(Pageable pageable);

    @Query("SELECT p FROM ProductJpaEntity p WHERE " +
           "(:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:categoryId IS NULL OR p.categoryId = :categoryId) AND " +
           "(:brandId IS NULL OR p.brandId = :brandId) AND " +
           "(:status IS NULL OR p.status = :status)")
    Page<ProductJpaEntity> findAllWithFilters(
        @Param("keyword") String keyword,
        @Param("categoryId") Long categoryId,
        @Param("brandId") Long brandId,
        @Param("status") String status,
        Pageable pageable);

    @Query("select distinct p.brandId from ProductJpaEntity p where p.categoryId = :categoryId")
    List<Long> findDistinctBrandIdsByCategoryId(@Param("categoryId") Long categoryId);
}