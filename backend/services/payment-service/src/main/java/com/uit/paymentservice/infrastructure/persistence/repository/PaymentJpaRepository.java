package com.uit.paymentservice.infrastructure.persistence.repository;

import com.uit.paymentservice.infrastructure.persistence.entity.PaymentTransactionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;

@Repository
public interface PaymentJpaRepository extends JpaRepository<PaymentTransactionJpaEntity, Long> {
    Optional<PaymentTransactionJpaEntity> findByIdempotencyKey(String idempotencyKey);
    Optional<PaymentTransactionJpaEntity> findByGatewayTransactionId(String gatewayTransactionId);
    Collection<PaymentTransactionJpaEntity> findByUserIdOrderByCreatedAtDesc(String userId);
}
