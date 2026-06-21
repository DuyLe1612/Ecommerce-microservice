package com.example.product.infrastructure.persistence.repository;

import com.example.product.infrastructure.persistence.entity.AttributeValueJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttributeValueRepository extends JpaRepository<AttributeValueJpaEntity, Long> {
    List<AttributeValueJpaEntity> findByAttributeId(Long attributeId);
}
