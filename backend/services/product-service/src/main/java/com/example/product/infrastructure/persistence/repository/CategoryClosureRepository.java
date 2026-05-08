package com.example.product.infrastructure.persistence.repository;

import com.example.product.infrastructure.persistence.entity.CategoryClosureJpaEntity;
import com.example.product.infrastructure.persistence.entity.CategoryClosureId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryClosureRepository extends JpaRepository<CategoryClosureJpaEntity, CategoryClosureId> {
    List<CategoryClosureJpaEntity> findByIdDescendantId(Long descendantId);
    List<CategoryClosureJpaEntity> findByIdAncestorId(Long ancestorId);
    List<CategoryClosureJpaEntity> findByDepth(Integer depth);
    void deleteByIdDescendantId(Long descendantId);
    void deleteByIdAncestorId(Long ancestorId);
    boolean existsByIdAncestorIdAndDepthGreaterThan(Long ancestorId, Integer depth);
}
