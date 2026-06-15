package com.uit.paymentservice.application.query;

import com.uit.paymentservice.domain.model.PaymentGatewayType;
import com.uit.paymentservice.domain.model.PaymentStatus;
import com.uit.paymentservice.domain.repository.PaymentRepository;
import com.uit.paymentservice.application.exception.PaymentNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class AdminListPaymentsQueryHandler {

    private static final Logger log = LoggerFactory.getLogger(AdminListPaymentsQueryHandler.class);

    private final PaymentRepository paymentRepository;

    public AdminListPaymentsQueryHandler(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public record PaymentFilter(
        PaymentStatus status,
        PaymentGatewayType gatewayType,
        LocalDate fromDate,
        LocalDate toDate,
        Long userId,
        Long orderId
    ) {}

    public Page<PaymentSummary> execute(PaymentFilter filter, Pageable pageable) {
        log.debug("Admin list payments: filter={}, page={}", filter, pageable);
        return paymentRepository.findAll(filter, pageable)
            .map(this::toSummary);
    }

    private PaymentSummary toSummary(com.uit.paymentservice.domain.model.PaymentTransaction tx) {
        return new PaymentSummary(
            tx.getId(),
            tx.getOrderId(),
            tx.getUserId(),
            tx.getAmount(),
            tx.getCurrency(),
            tx.getGatewayType().name(),
            tx.getStatus().name(),
            tx.getGatewayTransactionId(),
            tx.getFailureReason(),
            tx.getCreatedAt(),
            tx.getUpdatedAt(),
            tx.getExpiredAt()
        );
    }

    public record PaymentSummary(
        Long transactionId,
        Long orderId,
        Long userId,
        BigDecimal amount,
        String currency,
        String gatewayType,
        String status,
        String gatewayTransactionId,
        String failureReason,
        java.time.LocalDateTime createdAt,
        java.time.LocalDateTime updatedAt,
        java.time.LocalDateTime expiredAt
    ) {}
}
