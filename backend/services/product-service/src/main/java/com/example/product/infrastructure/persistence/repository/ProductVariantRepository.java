package com.example.product.infrastructure.persistence.repository;

import com.example.product.infrastructure.persistence.entity.ProductVariantJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductVariantRepository extends JpaRepository<ProductVariantJpaEntity, Long> {
    List<ProductVariantJpaEntity> findByProductId(Long productId);
    boolean existsBySku(String sku);
}
