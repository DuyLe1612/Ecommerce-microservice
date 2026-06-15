package com.uit.paymentservice.application.query;

import com.uit.paymentservice.domain.model.PaymentGatewayType;
import com.uit.paymentservice.domain.model.PaymentStatus;
import com.uit.paymentservice.domain.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class AdminPaymentStatisticsQueryHandler {

    private static final Logger log = LoggerFactory.getLogger(AdminPaymentStatisticsQueryHandler.class);

    private final PaymentRepository paymentRepository;

    public AdminPaymentStatisticsQueryHandler(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public PaymentStatistics execute(LocalDate fromDate, LocalDate toDate) {
        log.debug("Payment statistics: from={}, to={}", fromDate, toDate);
        return paymentRepository.getStatistics(fromDate, toDate);
    }

    public record PaymentStatistics(
        long totalTransactions,
        long successCount,
        long failedCount,
        long timeoutCount,
        long refundedCount,
        BigDecimal totalRevenue,
        double successRate,
        Map<PaymentGatewayType, GatewayStats> byGateway
    ) {}

    public record GatewayStats(
        long count,
        long successCount,
        BigDecimal revenue,
        double successRate
    ) {}
}
