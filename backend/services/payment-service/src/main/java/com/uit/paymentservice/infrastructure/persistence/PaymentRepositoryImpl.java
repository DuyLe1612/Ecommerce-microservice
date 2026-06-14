package com.uit.paymentservice.infrastructure.persistence;

import com.uit.paymentservice.domain.model.PaymentStatus;
import com.uit.paymentservice.domain.model.PaymentTransaction;
import com.uit.paymentservice.domain.repository.PaymentRepository;
import com.uit.paymentservice.infrastructure.persistence.entity.PaymentTransactionJpaEntity;
import com.uit.paymentservice.infrastructure.persistence.repository.PaymentJpaRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
public class PaymentRepositoryImpl implements PaymentRepository {

    private final PaymentJpaRepository jpaRepository;

    public PaymentRepositoryImpl(PaymentJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    @Transactional
    public PaymentTransaction save(PaymentTransaction tx) {
        PaymentTransactionJpaEntity entity = PaymentTransactionJpaEntity.fromDomain(tx);
        entity = jpaRepository.save(entity);
        return entity.toDomain();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PaymentTransaction> findById(Long id) {
        return jpaRepository.findById(id).map(PaymentTransactionJpaEntity::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PaymentTransaction> findByIdempotencyKey(String key) {
        return jpaRepository.findByIdempotencyKey(key).map(PaymentTransactionJpaEntity::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PaymentTransaction> findByGatewayTransactionId(String gatewayTxId) {
        return jpaRepository.findByGatewayTransactionId(gatewayTxId).map(PaymentTransactionJpaEntity::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PaymentTransaction> findLatestByOrderId(Long orderId) {
        return jpaRepository.findAll().stream()
            .filter(e -> e.getOrderId().equals(orderId))
            .max((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
            .map(PaymentTransactionJpaEntity::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentTransaction> findByOrderId(Long orderId) {
        return jpaRepository.findAll().stream()
            .filter(e -> e.getOrderId().equals(orderId))
            .map(PaymentTransactionJpaEntity::toDomain)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentTransaction> findProcessingExpiredBefore(LocalDateTime cutoff) {
        return jpaRepository.findAll().stream()
            .filter(e -> e.getStatus() == PaymentStatus.PROCESSING)
            .filter(e -> e.getExpiredAt() != null && e.getExpiredAt().isBefore(cutoff))
            .map(PaymentTransactionJpaEntity::toDomain)
            .toList();
    }
}
