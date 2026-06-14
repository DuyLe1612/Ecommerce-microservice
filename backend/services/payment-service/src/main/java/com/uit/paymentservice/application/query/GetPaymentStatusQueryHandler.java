package com.uit.paymentservice.application.query;

import com.uit.paymentservice.domain.model.PaymentTransaction;
import com.uit.paymentservice.domain.repository.PaymentRepository;
import com.uit.paymentservice.application.dto.PaymentStatusResponse;
import com.uit.paymentservice.application.exception.PaymentNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class GetPaymentStatusQueryHandler {

    private final PaymentRepository paymentRepository;

    public GetPaymentStatusQueryHandler(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public PaymentStatusResponse execute(Long transactionId) {
        PaymentTransaction tx = paymentRepository.findById(transactionId)
            .orElseThrow(() -> new PaymentNotFoundException("Payment not found: " + transactionId));

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
