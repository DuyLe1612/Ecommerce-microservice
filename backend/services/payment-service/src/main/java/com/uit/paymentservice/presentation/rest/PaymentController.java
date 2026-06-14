package com.uit.paymentservice.presentation.rest;

import com.uit.paymentservice.application.command.ProcessPaymentCommand;
import com.uit.paymentservice.application.command.ProcessPaymentCommandHandler;
import com.uit.paymentservice.application.dto.ProcessPaymentResponse;
import com.uit.paymentservice.application.dto.GatewayInfo;
import com.uit.paymentservice.application.dto.PaymentStatusResponse;
import com.uit.paymentservice.application.query.GetAvailableGatewaysQueryHandler;
import com.uit.paymentservice.application.query.GetOrderPaymentStatusQueryHandler;
import com.uit.paymentservice.application.query.GetPaymentStatusQueryHandler;
import com.uit.paymentservice.presentation.dto.ApiResponse;
import com.uit.paymentservice.security.UserContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@Tag(name = "Payments", description = "Payment processing and status management")
public class PaymentController {

    private final ProcessPaymentCommandHandler processPaymentHandler;
    private final GetPaymentStatusQueryHandler getPaymentStatusHandler;
    private final GetOrderPaymentStatusQueryHandler getOrderPaymentStatusHandler;
    private final GetAvailableGatewaysQueryHandler getAvailableGatewaysHandler;

    public PaymentController(
            ProcessPaymentCommandHandler processPaymentHandler,
            GetPaymentStatusQueryHandler getPaymentStatusHandler,
            GetOrderPaymentStatusQueryHandler getOrderPaymentStatusHandler,
            GetAvailableGatewaysQueryHandler getAvailableGatewaysHandler) {
        this.processPaymentHandler = processPaymentHandler;
        this.getPaymentStatusHandler = getPaymentStatusHandler;
        this.getOrderPaymentStatusHandler = getOrderPaymentStatusHandler;
        this.getAvailableGatewaysHandler = getAvailableGatewaysHandler;
    }

    @Operation(
        summary = "Initiate a payment",
        description = "Starts a new payment transaction via the specified gateway. " +
            "This operation is idempotent — supplying the same `Idempotency-Key` returns the original response. " +
            "The order is validated against order-service before a gateway redirect URL is generated."
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Payment initiated successfully",
            content = @Content(schema = @Schema(implementation = ApiResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Invalid request body or missing Idempotency-Key header",
            content = @Content),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Missing or invalid JWT token",
            content = @Content),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Order not found or does not belong to the authenticated user",
            content = @Content),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "409",
            description = "Payment amount mismatch between request and order",
            content = @Content)
    })
    @PostMapping("/process")
    public ResponseEntity<ApiResponse<ProcessPaymentResponse>> processPayment(
            @Valid @RequestBody ProcessPaymentCommand command,
            @Parameter(
                description = "UUID idempotency key. Duplicate requests with the same key return the cached response.",
                required = true,
                example = "550e8400-e29b-41d4-a716-446655440000")
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @Parameter(hidden = true) @AuthenticationPrincipal UserContext userContext) {

        ProcessPaymentResponse response = processPaymentHandler.execute(command, userContext.userId(), idempotencyKey);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(
        summary = "List available payment gateways",
        description = "Returns all configured gateways with their display names, descriptions, and whether they are mock simulators."
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "List of available gateways",
            content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    @GetMapping("/gateways")
    public ResponseEntity<ApiResponse<List<GatewayInfo>>> getAvailableGateways() {
        List<GatewayInfo> gateways = getAvailableGatewaysHandler.execute();
        return ResponseEntity.ok(ApiResponse.success(gateways));
    }

    @Operation(
        summary = "Get payment status by transaction ID",
        description = "Retrieves the current status of a payment transaction. " +
            "Users can only view their own transactions unless they have the ADMIN role."
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Payment status retrieved",
            content = @Content(schema = @Schema(implementation = ApiResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Missing or invalid JWT",
            content = @Content),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Transaction not found",
            content = @Content)
    })
    @GetMapping("/status/{transactionId}")
    public ResponseEntity<ApiResponse<PaymentStatusResponse>> getPaymentStatus(
            @Parameter(description = "Payment transaction ID", example = "1")
            @PathVariable Long transactionId,
            @Parameter(hidden = true) @AuthenticationPrincipal UserContext userContext) {

        PaymentStatusResponse response = getPaymentStatusHandler.execute(transactionId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(
        summary = "Get latest payment status for an order",
        description = "Retrieves the most recent payment transaction associated with a given order ID."
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Payment status retrieved",
            content = @Content(schema = @Schema(implementation = ApiResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Missing or invalid JWT",
            content = @Content),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "No payment found for this order",
            content = @Content)
    })
    @GetMapping("/order/{orderId}/status")
    public ResponseEntity<ApiResponse<PaymentStatusResponse>> getOrderPaymentStatus(
            @Parameter(description = "Order ID", example = "100")
            @PathVariable Long orderId,
            @Parameter(hidden = true) @AuthenticationPrincipal UserContext userContext) {

        return getOrderPaymentStatusHandler.execute(orderId)
            .map(response -> ResponseEntity.ok(ApiResponse.success(response)))
            .orElse(ResponseEntity.notFound().build());
    }
}
