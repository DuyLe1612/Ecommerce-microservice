package com.uit.paymentservice.domain.repository;

import com.uit.paymentservice.application.query.AdminPaymentStatisticsQueryHandler;
import com.uit.paymentservice.application.query.AdminListPaymentsQueryHandler;
import com.uit.paymentservice.domain.model.PaymentStatus;
import com.uit.paymentservice.domain.model.PaymentTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository {
    PaymentTransaction save(PaymentTransaction tx);
    Optional<PaymentTransaction> findById(Long id);
    Optional<PaymentTransaction> findByIdempotencyKey(String key);
    Optional<PaymentTransaction> findByGatewayTransactionId(String gatewayTxId);
    Optional<PaymentTransaction> findLatestByOrderId(Long orderId);
    List<PaymentTransaction> findByOrderId(Long orderId);
    List<PaymentTransaction> findProcessingExpiredBefore(LocalDateTime cutoff);
    Page<PaymentTransaction> findAll(AdminListPaymentsQueryHandler.PaymentFilter filter, Pageable pageable);
    AdminPaymentStatisticsQueryHandler.PaymentStatistics getStatistics(LocalDate from, LocalDate to);
    List<PaymentTransaction> findByUserId(String userId);
}
