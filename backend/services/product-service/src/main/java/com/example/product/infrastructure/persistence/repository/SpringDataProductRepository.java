package com.example.product.infrastructure.persistence.repository;

import com.example.product.infrastructure.persistence.entity.ProductJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataProductRepository extends JpaRepository<ProductJpaEntity, Long> {
}
