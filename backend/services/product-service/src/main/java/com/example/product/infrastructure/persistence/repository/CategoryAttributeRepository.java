package com.example.product.infrastructure.persistence.repository;

import com.example.product.infrastructure.persistence.entity.CategoryAttributeJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryAttributeRepository extends JpaRepository<CategoryAttributeJpaEntity, Long> {
    List<CategoryAttributeJpaEntity> findByCategoryId(Long categoryId);
    void deleteByCategoryId(Long categoryId);
}
