package com.example.product.infrastructure.persistence.repository;

import com.example.product.infrastructure.persistence.entity.ProductJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SpringDataProductRepository extends JpaRepository<ProductJpaEntity, Long> {
    Optional<ProductJpaEntity> findBySlug(String slug);

    @Query("select distinct p.brandId from ProductJpaEntity p where p.categoryId = :categoryId")
    List<Long> findDistinctBrandIdsByCategoryId(@Param("categoryId") Long categoryId);
}