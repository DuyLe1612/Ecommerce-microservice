package com.uit.paymentservice.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

@Schema(description = "Request to refund a payment transaction")
public record RefundRequest(
    @Schema(description = "Amount to refund", example = "100000")
    @NotNull @Positive BigDecimal refundAmount,

    @Schema(description = "Reason for the refund", example = "Customer requested cancellation")
    String reason
) {}
