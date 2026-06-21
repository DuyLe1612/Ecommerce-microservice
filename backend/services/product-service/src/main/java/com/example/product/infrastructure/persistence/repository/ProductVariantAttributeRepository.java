package com.example.product.infrastructure.persistence.repository;

import com.example.product.infrastructure.persistence.entity.ProductVariantAttributeJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductVariantAttributeRepository extends JpaRepository<ProductVariantAttributeJpaEntity, ProductVariantAttributeJpaEntity.ProductVariantAttributeId> {
    List<ProductVariantAttributeJpaEntity> findByVariantId(Long variantId);
    void deleteByVariantId(Long variantId);
}
