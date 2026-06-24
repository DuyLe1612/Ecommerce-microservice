package com.uit.paymentservice.application.command;

import com.uit.paymentservice.domain.model.PaymentGatewayType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

@Schema(description = "Request to initiate a payment transaction")
public record ProcessPaymentCommand(

    @Schema(description = "Order ID to be paid", example = "123")
    @NotNull Long orderId,

    @Schema(description = "Payment amount (must match order total)", example = "100000")
    @NotNull @Positive BigDecimal amount,

    @Schema(description = "Currency code (ISO 4217)", example = "VND")
    @NotBlank String currency,

    @Schema(description = "Payment gateway type", example = "MOMO")
    @NotNull PaymentGatewayType gatewayType,

    @Schema(description = "URL to redirect customer after payment completion", example = "https://example.com/payment/result")
    String returnUrl,

    @Schema(description = "Payment description / memo", example = "Order #123 payment")
    String description
) {}
