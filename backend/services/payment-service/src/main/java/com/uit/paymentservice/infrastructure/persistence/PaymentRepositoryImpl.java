package com.uit.paymentservice.infrastructure.persistence;

import com.uit.paymentservice.application.query.AdminListPaymentsQueryHandler;
import com.uit.paymentservice.application.query.AdminPaymentStatisticsQueryHandler;
import com.uit.paymentservice.domain.model.PaymentGatewayType;
import com.uit.paymentservice.domain.model.PaymentStatus;
import com.uit.paymentservice.domain.model.PaymentTransaction;
import com.uit.paymentservice.domain.repository.PaymentRepository;
import com.uit.paymentservice.infrastructure.persistence.entity.PaymentTransactionJpaEntity;
import com.uit.paymentservice.infrastructure.persistence.repository.PaymentJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
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
    public List<PaymentTransaction> findByUserId(Long userId) {
        return jpaRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(PaymentTransactionJpaEntity::toDomain)
                .toList();
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

    @Override
    @Transactional(readOnly = true)
    public Page<PaymentTransaction> findAll(AdminListPaymentsQueryHandler.PaymentFilter filter, Pageable pageable) {
        List<PaymentTransactionJpaEntity> all = jpaRepository.findAll();
        List<PaymentTransactionJpaEntity> filtered = all.stream()
            .filter(e -> filter.status() == null || e.getStatus() == filter.status())
            .filter(e -> filter.gatewayType() == null || e.getGatewayType() == filter.gatewayType())
            .filter(e -> filter.userId() == null || e.getUserId().equals(filter.userId()))
            .filter(e -> filter.orderId() == null || e.getOrderId().equals(filter.orderId()))
            .filter(e -> filter.fromDate() == null || !e.getCreatedAt().toLocalDate().isBefore(filter.fromDate()))
            .filter(e -> filter.toDate() == null || !e.getCreatedAt().toLocalDate().isAfter(filter.toDate().plusDays(1)))
            .toList();

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filtered.size());
        List<PaymentTransaction> page = start >= filtered.size()
            ? List.of()
            : filtered.subList(start, end).stream().map(PaymentTransactionJpaEntity::toDomain).toList();

        return new PageImpl<>(page, pageable, filtered.size());
    }

    @Override
    @Transactional(readOnly = true)
    public AdminPaymentStatisticsQueryHandler.PaymentStatistics getStatistics(LocalDate fromDate, LocalDate toDate) {
        LocalDateTime from = fromDate != null ? fromDate.atStartOfDay() : LocalDateTime.MIN;
        LocalDateTime to = toDate != null ? toDate.atTime(LocalTime.MAX) : LocalDateTime.MAX;

        List<PaymentTransactionJpaEntity> all = jpaRepository.findAll().stream()
            .filter(e -> !e.getCreatedAt().isBefore(from))
            .filter(e -> !e.getCreatedAt().isAfter(to))
            .toList();

        long total = all.size();
        long success = all.stream().filter(e -> e.getStatus() == PaymentStatus.SUCCESS).count();
        long failed = all.stream().filter(e -> e.getStatus() == PaymentStatus.FAILED).count();
        long timeout = all.stream().filter(e -> e.getStatus() == PaymentStatus.TIMEOUT).count();
        long refunded = all.stream().filter(e -> e.getStatus() == PaymentStatus.REFUNDED).count();
        java.math.BigDecimal revenue = all.stream()
            .filter(e -> e.getStatus() == PaymentStatus.SUCCESS)
            .map(e -> e.getAmount())
            .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        double successRate = total > 0 ? (double) success / total : 0.0;

        Map<PaymentGatewayType, AdminPaymentStatisticsQueryHandler.GatewayStats> byGateway = new EnumMap<>(PaymentGatewayType.class);
        for (PaymentGatewayType gt : PaymentGatewayType.values()) {
            List<PaymentTransactionJpaEntity> gList = all.stream()
                .filter(e -> e.getGatewayType() == gt).toList();
            long gTotal = gList.size();
            long gSuccess = gList.stream().filter(e -> e.getStatus() == PaymentStatus.SUCCESS).count();
            java.math.BigDecimal gRevenue = gList.stream()
                .filter(e -> e.getStatus() == PaymentStatus.SUCCESS)
                .map(e -> e.getAmount())
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
            byGateway.put(gt, new AdminPaymentStatisticsQueryHandler.GatewayStats(
                gTotal, gSuccess, gRevenue, gTotal > 0 ? (double) gSuccess / gTotal : 0.0));
        }

        return new AdminPaymentStatisticsQueryHandler.PaymentStatistics(
            total, success, failed, timeout, refunded, revenue, successRate, byGateway);
    }
}
