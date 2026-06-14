package com.uit.paymentservice.application.dto;

import com.uit.paymentservice.domain.model.PaymentStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "Response returned after a payment is initiated")
public record ProcessPaymentResponse(

    @Schema(description = "Internal payment transaction ID", example = "1")
    Long transactionId,

    @Schema(description = "Idempotency key used for this request", example = "550e8400-e29b-41d4-a716-446655440000")
    String idempotencyKey,

    @Schema(description = "Current payment status", example = "PROCESSING",
        allowableValues = {"PENDING", "PROCESSING", "SUCCESS", "FAILED", "TIMEOUT", "REFUNDED"})
    String status,

    @Schema(description = "Redirect URL to the payment gateway page", example = "https://momo.vn/pay/abc123")
    String redirectUrl,

    @Schema(description = "Gateway used for this payment", example = "MOMO")
    String gatewayType,

    @Schema(description = "Timestamp when this payment expires if not completed", example = "2026-06-14T20:00:00")
    LocalDateTime expiredAt
) {}
