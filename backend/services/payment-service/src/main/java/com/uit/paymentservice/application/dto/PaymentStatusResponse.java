package com.uit.paymentservice.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Schema(description = "Full payment transaction status details")
public record PaymentStatusResponse(

    @Schema(description = "Payment transaction ID", example = "1")
    Long transactionId,

    @Schema(description = "Associated order ID", example = "123")
    Long orderId,

    @Schema(description = "User ID who owns this payment", example = "550e8400-e29b-41d4-a716-446655440000")
    String userId,

    @Schema(description = "Payment amount", example = "100000")
    BigDecimal amount,

    @Schema(description = "Currency code", example = "VND")
    String currency,

    @Schema(description = "Payment gateway used", example = "MOMO")
    String gatewayType,

    @Schema(description = "Current status", example = "SUCCESS",
        allowableValues = {"PENDING", "PROCESSING", "SUCCESS", "FAILED", "TIMEOUT", "REFUNDED"})
    String status,

    @Schema(description = "Gateway's own transaction reference ID", example = "MOMO123456789")
    String gatewayTransactionId,

    @Schema(description = "Redirect URL for the gateway", example = "https://momo.vn/pay/abc")
    String redirectUrl,

    @Schema(description = "Reason for failure (if status is FAILED)", example = "Insufficient funds")
    String failureReason,

    @Schema(description = "When the transaction was created", example = "2026-06-14T19:00:00")
    LocalDateTime createdAt,

    @Schema(description = "When the transaction was last updated", example = "2026-06-14T19:05:00")
    LocalDateTime updatedAt,

    @Schema(description = "Payment expiry timestamp", example = "2026-06-14T19:15:00")
    LocalDateTime expiredAt
) {}
