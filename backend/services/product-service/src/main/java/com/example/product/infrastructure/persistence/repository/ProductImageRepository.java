package com.example.product.infrastructure.persistence.repository;

import com.example.product.infrastructure.persistence.entity.ProductImageJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductImageRepository extends JpaRepository<ProductImageJpaEntity, Long> {
    List<ProductImageJpaEntity> findByProductId(Long productId);
}
