package com.uit.paymentservice.application.query;

import com.uit.paymentservice.domain.model.PaymentTransaction;
import com.uit.paymentservice.domain.repository.PaymentRepository;
import com.uit.paymentservice.application.dto.PaymentStatusResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class GetOrderPaymentStatusQueryHandler {

    private final PaymentRepository paymentRepository;

    public GetOrderPaymentStatusQueryHandler(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public Optional<PaymentStatusResponse> execute(Long orderId) {
        return paymentRepository.findLatestByOrderId(orderId)
            .map(this::toResponse);
    }

    private PaymentStatusResponse toResponse(PaymentTransaction tx) {
        return new PaymentStatusResponse(
            tx.getId(),
            tx.getOrderId(),
            tx.getUserId(),
            tx.getAmount(),
            tx.getCurrency(),
            tx.getGatewayType().name(),
            tx.getStatus().name(),
            tx.getGatewayTransactionId(),
            tx.getSimulatedRedirectUrl(),
            tx.getFailureReason(),
            tx.getCreatedAt(),
            tx.getUpdatedAt(),
            tx.getExpiredAt()
        );
    }
}
