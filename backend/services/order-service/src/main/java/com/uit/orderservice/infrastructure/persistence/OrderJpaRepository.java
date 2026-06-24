package com.uit.orderservice.infrastructure.persistence;

import com.uit.orderservice.domain.model.OrderStatus;
import com.uit.orderservice.infrastructure.persistence.entity.OrderJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderJpaRepository extends JpaRepository<OrderJpaEntity, Long> {

    Optional<OrderJpaEntity> findByOrderNumber(String orderNumber);

    List<OrderJpaEntity> findByUserIdOrderByCreatedAtDesc(String userId);

    Page<OrderJpaEntity> findByUserId(String userId, Pageable pageable);

    List<OrderJpaEntity> findByStatus(OrderStatus status);

    Page<OrderJpaEntity> findByStatus(OrderStatus status, Pageable pageable);

    @Query("SELECT o FROM OrderJpaEntity o WHERE " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:userId IS NULL OR o.userId = :userId) AND " +
           "(:fromDate IS NULL OR o.createdAt >= :fromDate) AND " +
           "(:toDate IS NULL OR o.createdAt <= :toDate)")
    Page<OrderJpaEntity> findAll(@Param("status") OrderStatus status,
                                  @Param("userId") String userId,
                                  @Param("fromDate") LocalDateTime fromDate,
                                  @Param("toDate") LocalDateTime toDate,
                                  Pageable pageable);

    @Query(value = "SELECT COUNT(*) > 0 FROM orders o " +
           "JOIN order_items oi ON o.id = oi.order_id " +
           "WHERE o.user_id = :userId AND oi.product_id = :productId " +
           "AND o.status = 'DELIVERED'",
           nativeQuery = true)
    boolean existsDeliveredOrderWithProduct(@Param("userId") String userId, @Param("productId") Long productId);

    @Query("SELECT COUNT(o) FROM OrderJpaEntity o WHERE o.status = :status")
    long countByStatus(@Param("status") OrderStatus status);

    @Query("SELECT SUM(o.totalAmount) FROM OrderJpaEntity o WHERE o.status = 'DELIVERED'")
    BigDecimal sumRevenue();

    @Query("SELECT COUNT(o) FROM OrderJpaEntity o")
    long countTotal();
}
