package com.example.product.infrastructure.persistence.repository;

import com.example.product.infrastructure.persistence.entity.BrandJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BrandRepository extends JpaRepository<BrandJpaEntity, Long> {
    Optional<BrandJpaEntity> findBySlug(String slug);
}
