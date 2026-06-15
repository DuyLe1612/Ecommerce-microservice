package com.uit.paymentservice.presentation.rest;

import com.uit.paymentservice.application.command.HandleCallbackCommand;
import com.uit.paymentservice.domain.model.PaymentGatewayType;
import com.uit.paymentservice.domain.model.PaymentTransaction;
import com.uit.paymentservice.domain.repository.PaymentRepository;
import com.uit.paymentservice.infrastructure.gateway.PaymentGatewayFactory;
import com.uit.paymentservice.presentation.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Test/dev endpoints for simulating payment gateway callbacks.
 * These endpoints advance the payment state machine and publish RabbitMQ events.
 */
@RestController
@RequestMapping("/api/simulator")
@Tag(
    name = "Simulator (Dev Only)",
    description = "Test helpers for simulating gateway callbacks and inspecting payment state."
)
public class SimulatorTestController {

    private final PaymentRepository paymentRepository;
    private final PaymentGatewayFactory gatewayFactory;
    private final HandleCallbackCommand handleCallbackCommand;

    public SimulatorTestController(
            PaymentRepository paymentRepository,
            PaymentGatewayFactory gatewayFactory,
            HandleCallbackCommand handleCallbackCommand) {
        this.paymentRepository = paymentRepository;
        this.gatewayFactory = gatewayFactory;
        this.handleCallbackCommand = handleCallbackCommand;
    }

    @Operation(
        summary = "Trigger a simulated gateway callback",
        description = "Advances the payment transaction state machine and publishes the corresponding RabbitMQ event. " +
            "Use this to test the full order-payment flow without a real payment gateway. " +
            "POST /api/payment/process creates the transaction, then call this to complete it."
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Callback triggered and transaction updated",
            content = @Content(schema = @Schema(implementation = TriggerCallbackResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Transaction not found",
            content = @Content),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "409",
            description = "Invalid state transition (e.g. already completed)",
            content = @Content)
    })
    @PostMapping("/trigger-callback")
    public ApiResponse<TriggerCallbackResponse> triggerCallback(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                required = true,
                description = "Callback trigger parameters",
                content = @Content(schema = @Schema(implementation = TriggerCallbackRequest.class)))
            @RequestBody TriggerCallbackRequest request) {

        var gateway = gatewayFactory.get(request.gatewayType());
        if (gateway == null) {
            return ApiResponse.error("UNSUPPORTED_GATEWAY", "Gateway not supported: " + request.gatewayType());
        }

        PaymentTransaction tx = paymentRepository.findById(request.transactionId()).orElse(null);
        if (tx == null) {
            return ApiResponse.error("NOT_FOUND", "Transaction not found: " + request.transactionId());
        }

        Map<String, String> params = buildCallbackParams(tx, request.gatewayType(), request.success());

        try {
            handleCallbackCommand.execute(request.gatewayType(), params);
            tx = paymentRepository.findById(request.transactionId()).orElse(tx);
            return ApiResponse.success(new TriggerCallbackResponse(
                tx.getId(),
                request.gatewayType().name(),
                tx.getStatus().name(),
                tx.getStatus().name()
            ));
        } catch (Exception e) {
            return ApiResponse.error("CALLBACK_FAILED", e.getMessage());
        }
    }

    private Map<String, String> buildCallbackParams(PaymentTransaction tx, PaymentGatewayType type, boolean success) {
        String successCode = switch (type) {
            case MOMO -> "0";
            case VNPAY -> "00";
            default -> "SUCCESS";
        };
        String failureCode = switch (type) {
            case MOMO -> "99";
            case VNPAY -> "99";
            default -> "FAILED";
        };

        String resultCode = success ? successCode : failureCode;
        String status = success ? "SUCCESS" : "FAILED";
        String reason = success ? "Success" : "Simulated failure";

        return switch (type) {
            case MOMO -> Map.of(
                "requestId", tx.getIdempotencyKey(),
                "orderId", String.valueOf(tx.getOrderId()),
                "resultCode", resultCode,
                "amount", String.valueOf(tx.getAmount()),
                "message", reason
            );
            case VNPAY -> Map.of(
                "vnp_TxnRef", tx.getIdempotencyKey(),
                "vnp_Amount", tx.getAmount().multiply(java.math.BigDecimal.valueOf(100)).toBigInteger().toString(),
                "vnp_ResponseCode", resultCode,
                "vnp_TransactionNo", "MOCK_" + System.currentTimeMillis(),
                "vnp_PayDate", java.time.LocalDateTime.now().format(
                    java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss")),
                "vnp_BankCode", "NCB"
            );
            case ZALOPAY, PAYPAL, STRIPE -> Map.of(
                "requestId", tx.getIdempotencyKey(),
                "orderId", String.valueOf(tx.getOrderId()),
                "status", status,
                "amount", String.valueOf(tx.getAmount()),
                "gatewayTransactionId", "MOCK_" + System.currentTimeMillis()
            );
        };
    }

    @Operation(summary = "Get all payment transactions for an order")
    @GetMapping("/transactions/{orderId}")
    public ApiResponse<List<PaymentTransaction>> getTransactions(
            @Parameter(description = "Order ID", example = "100")
            @PathVariable Long orderId) {
        List<PaymentTransaction> transactions = paymentRepository.findByOrderId(orderId);
        return ApiResponse.success(transactions);
    }

    public record TriggerCallbackRequest(
        @Parameter(description = "Payment transaction ID", example = "1")
        Long transactionId,
        @Parameter(description = "Gateway to simulate", example = "MOMO")
        PaymentGatewayType gatewayType,
        @Parameter(description = "true = success, false = failure", example = "true")
        boolean success
    ) {}

    public record TriggerCallbackResponse(
        @Schema(description = "Payment transaction ID")
        Long transactionId,
        @Schema(description = "Gateway used")
        String gatewayType,
        @Schema(description = "Payment status after callback")
        String status,
        @Schema(description = "Gateway status string")
        String gatewayStatus
    ) {}
}
