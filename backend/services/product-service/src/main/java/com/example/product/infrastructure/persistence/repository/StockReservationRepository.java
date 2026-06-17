package com.example.product.infrastructure.persistence.repository;

import com.example.product.infrastructure.persistence.entity.StockReservationJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface StockReservationRepository extends JpaRepository<StockReservationJpaEntity, Long> {
    List<StockReservationJpaEntity> findByVariantIdAndStatus(Long variantId, String status);
    List<StockReservationJpaEntity> findByOrderId(Long orderId);
    
    @Query("SELECT COALESCE(SUM(r.quantity), 0) FROM StockReservationJpaEntity r " +
           "WHERE r.variantId = :variantId AND r.status = 'RESERVED'")
    Integer sumReservedQuantity(@Param("variantId") Long variantId);
}
