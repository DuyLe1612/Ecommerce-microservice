package com.uit.paymentservice.presentation.rest;

import com.uit.paymentservice.application.dto.ProcessPaymentResponse;
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

@RestController
@RequestMapping("/api/simulator")
@Tag(
    name = "Simulator (Dev Only)",
    description = "Test helpers for gateway simulation. These endpoints are intended for local development and automated testing only."
)
public class SimulatorTestController {

    private final PaymentRepository paymentRepository;
    private final PaymentGatewayFactory gatewayFactory;

    public SimulatorTestController(PaymentRepository paymentRepository,
                                  PaymentGatewayFactory gatewayFactory) {
        this.paymentRepository = paymentRepository;
        this.gatewayFactory = gatewayFactory;
    }

    @Operation(
        summary = "Trigger a simulated gateway callback",
        description = "Injects a callback directly into the payment gateway to simulate success or failure. " +
            "Useful for testing payment completion flows without a real gateway. " +
            "The `resultCode=0` simulates success; `resultCode=99` simulates failure."
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Callback triggered",
            content = @Content(schema = @Schema(implementation = TriggerCallbackResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Transaction not found",
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

        Map<String, String> params = request.success()
            ? Map.of(
                "requestId", tx.getIdempotencyKey(),
                "resultCode", "0",
                "orderId", String.valueOf(tx.getOrderId()),
                "amount", String.valueOf(tx.getAmount())
            )
            : Map.of(
                "requestId", tx.getIdempotencyKey(),
                "resultCode", "99",
                "orderId", String.valueOf(tx.getOrderId()),
                "amount", String.valueOf(tx.getAmount())
            );

        var result = gateway.processCallback(params);

        return ApiResponse.success(new TriggerCallbackResponse(
            tx.getId(),
            request.gatewayType().name(),
            result.success(),
            result.status()
        ));
    }

    @Operation(summary = "Get latest payment for a given order (dev only)")
    @GetMapping("/transactions/{orderId}")
    public ApiResponse<List<PaymentTransaction>> getTransactions(
            @Parameter(description = "Order ID", example = "100")
            @PathVariable Long orderId) {
        List<PaymentTransaction> transactions = paymentRepository.findByOrderId(orderId);
        return ApiResponse.success(transactions);
    }

    @Operation(summary = "Reset simulator state")
    @PostMapping("/reset")
    public ApiResponse<String> resetSimulator() {
        return ApiResponse.success("Simulator reset successfully (in-memory state cleared)");
    }

    public record TriggerCallbackRequest(
        @Parameter(description = "Payment transaction ID", example = "1")
        Long transactionId,
        @Parameter(description = "Gateway to simulate", example = "MOMO")
        PaymentGatewayType gatewayType,
        @Parameter(description = "true = success (resultCode=0), false = failure (resultCode=99)", example = "true")
        boolean success
    ) {}

    @Schema(description = "Result of triggering a simulated callback")
    public record TriggerCallbackResponse(
        @Schema(description = "Payment transaction ID", example = "1")
        Long transactionId,
        @Schema(description = "Gateway used", example = "MOMO")
        String gatewayType,
        @Schema(description = "Whether the gateway marked the payment as successful", example = "true")
        boolean callbackSuccess,
        @Schema(description = "Status returned by the gateway", example = "SUCCESS")
        String gatewayStatus
    ) {}
}
