package com.example.product.infrastructure.persistence.repository;

import com.example.product.infrastructure.persistence.entity.SeedMigrationJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SeedMigrationRepository extends JpaRepository<SeedMigrationJpaEntity, String> {
}
