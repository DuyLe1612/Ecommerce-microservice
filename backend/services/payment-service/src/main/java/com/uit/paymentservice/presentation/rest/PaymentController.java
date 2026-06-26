package com.uit.paymentservice.presentation.rest;

import com.uit.paymentservice.application.command.ProcessPaymentCommand;
import com.uit.paymentservice.application.command.ProcessPaymentCommandHandler;
import com.uit.paymentservice.application.dto.ProcessPaymentResponse;
import com.uit.paymentservice.application.dto.GatewayInfo;
import com.uit.paymentservice.application.dto.PaymentStatusResponse;
import com.uit.paymentservice.application.query.GetAvailableGatewaysQueryHandler;
import com.uit.paymentservice.application.query.GetMyPaymentsQueryHandler;
import com.uit.paymentservice.application.query.GetOrderPaymentStatusQueryHandler;
import com.uit.paymentservice.application.query.GetPaymentStatusQueryHandler;
import com.uit.paymentservice.presentation.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@Tag(name = "Payments", description = "Payment processing and status management")
public class PaymentController {

    private final ProcessPaymentCommandHandler processPaymentHandler;
    private final GetPaymentStatusQueryHandler getPaymentStatusHandler;
    private final GetOrderPaymentStatusQueryHandler getOrderPaymentStatusHandler;
    private final GetAvailableGatewaysQueryHandler getAvailableGatewaysHandler;
    private final GetMyPaymentsQueryHandler getMyPaymentsHandler;

    public PaymentController(
            ProcessPaymentCommandHandler processPaymentHandler,
            GetPaymentStatusQueryHandler getPaymentStatusHandler,
            GetOrderPaymentStatusQueryHandler getOrderPaymentStatusHandler,
            GetAvailableGatewaysQueryHandler getAvailableGatewaysHandler, GetMyPaymentsQueryHandler getMyPaymentsHandler) {
        this.processPaymentHandler = processPaymentHandler;
        this.getPaymentStatusHandler = getPaymentStatusHandler;
        this.getOrderPaymentStatusHandler = getOrderPaymentStatusHandler;
        this.getAvailableGatewaysHandler = getAvailableGatewaysHandler;
        this.getMyPaymentsHandler = getMyPaymentsHandler;
    }

    @Operation(
        summary = "Initiate a payment",
        description = "Starts a new payment transaction via the specified gateway. " +
            "This operation is idempotent — supplying the same `Idempotency-Key` returns the original response."
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
            @RequestHeader("Idempotency-Key") String idempotencyKey) {

        String userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("UNAUTHORIZED", "User identity required"));
        }

        ProcessPaymentResponse response = processPaymentHandler.execute(command, userId, idempotencyKey);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Get current user's payment history")
    @GetMapping("/my-payments")
    public ResponseEntity<ApiResponse<GetMyPaymentsQueryHandler.MyPaymentsResponse>> getMyPayments(
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "20")
            @RequestParam(defaultValue = "20") int pageSize) {

        String userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("UNAUTHORIZED", "User identity required"));
        }

        var result = getMyPaymentsHandler.execute(userId, page, pageSize);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null
                && auth.isAuthenticated()
                && !(auth instanceof AnonymousAuthenticationToken)
                && auth.getPrincipal() != null
                && !"anonymousUser".equals(auth.getPrincipal().toString())) {
            return auth.getPrincipal().toString();
        }
        return null;
    }


    @Operation(
        summary = "List available payment gateways",
        description = "Returns all configured gateways with their display names, descriptions, and whether they are mock simulators."
    )
    @GetMapping("/gateways")
    public ResponseEntity<ApiResponse<List<GatewayInfo>>> getAvailableGateways() {
        List<GatewayInfo> gateways = getAvailableGatewaysHandler.execute();
        return ResponseEntity.ok(ApiResponse.success(gateways));
    }

    @Operation(summary = "Get payment status by transaction ID")
    @GetMapping("/status/{transactionId}")
    public ResponseEntity<ApiResponse<PaymentStatusResponse>> getPaymentStatus(
            @Parameter(description = "Payment transaction ID", example = "1")
            @PathVariable Long transactionId) {
        PaymentStatusResponse response = getPaymentStatusHandler.execute(transactionId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Get latest payment status for an order")
    @GetMapping("/order/{orderId}/status")
    public ResponseEntity<ApiResponse<PaymentStatusResponse>> getOrderPaymentStatus(
            @Parameter(description = "Order ID", example = "100")
            @PathVariable Long orderId) {
        return getOrderPaymentStatusHandler.execute(orderId)
            .map(response -> ResponseEntity.ok(ApiResponse.success(response)))
            .orElse(ResponseEntity.notFound().build());
    }
}
