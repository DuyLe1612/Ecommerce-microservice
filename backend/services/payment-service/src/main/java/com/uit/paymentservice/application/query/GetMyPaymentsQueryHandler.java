package com.uit.paymentservice.application.query;

import com.uit.paymentservice.domain.model.PaymentTransaction;
import com.uit.paymentservice.domain.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class GetMyPaymentsQueryHandler {

    private final PaymentRepository paymentRepository;

    public GetMyPaymentsQueryHandler(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public MyPaymentsResponse execute(Long userId, int page, int pageSize) {
        List<PaymentTransaction> all = paymentRepository.findByUserId(userId);

        int totalRecords = all.size();
        int totalPages = (int) Math.ceil((double) totalRecords / pageSize);
        int start = page * pageSize;
        int end = Math.min(start + pageSize, totalRecords);

        List<PaymentHistoryItem> items = start >= totalRecords
                ? List.of()
                : all.subList(start, end).stream().map(this::toItem).toList();

        return new MyPaymentsResponse(items, page, pageSize, totalRecords, totalPages);
    }

    private PaymentHistoryItem toItem(PaymentTransaction tx) {
        return new PaymentHistoryItem(
                tx.getId(),
                tx.getOrderId(),
                null, // orderNumber — populated by order-service lookup if needed
                tx.getIdempotencyKey(),
                null, // gateway id — PaymentGatewayType has no numeric ID
                tx.getGatewayType().name(),
                null, // method id
                tx.getGatewayType().name(),
                tx.getStatus().ordinal(),
                tx.getStatus().name(),
                tx.getAmount(),
                tx.getCurrency(),
                tx.getCreatedAt(),
                tx.getUpdatedAt(),
                tx.getFailureReason()
        );
    }

    public record MyPaymentsResponse(
            List<PaymentHistoryItem> data,
            int page,
            int pageSize,
            int totalRecords,
            int totalPages
    ) {}

    public record PaymentHistoryItem(
            Long paymentId,
            Long orderId,
            String orderNumber,
            String transactionId,
            Integer gateway,
            String gatewayName,
            Integer method,
            String methodName,
            int status,
            String statusName,
            java.math.BigDecimal amount,
            String currency,
            java.time.LocalDateTime createdAt,
            java.time.LocalDateTime completedAt,
            String errorMessage
    ) {}
}
