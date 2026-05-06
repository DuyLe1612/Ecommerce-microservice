package com.example.product.infrastructure.persistence.repository;

import com.example.product.infrastructure.persistence.entity.ProductAttributeJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductAttributeRepository extends JpaRepository<ProductAttributeJpaEntity, Long> {
    List<ProductAttributeJpaEntity> findByProductId(Long productId);
    void deleteByProductId(Long productId);
}
