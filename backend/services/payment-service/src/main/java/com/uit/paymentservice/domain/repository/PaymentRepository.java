package com.uit.paymentservice.domain.repository;

import com.uit.paymentservice.domain.model.PaymentStatus;
import com.uit.paymentservice.domain.model.PaymentTransaction;
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
}
