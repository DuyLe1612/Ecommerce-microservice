package com.uit.paymentservice.presentation.rest;

import com.uit.paymentservice.application.command.RefundPaymentCommand;
import com.uit.paymentservice.application.command.CheckPaymentTimeoutsCommand;
import com.uit.paymentservice.application.dto.RefundRequest;
import com.uit.paymentservice.application.query.AdminListPaymentsQueryHandler;
import com.uit.paymentservice.application.query.AdminPaymentStatisticsQueryHandler;
import com.uit.paymentservice.domain.model.PaymentGatewayType;
import com.uit.paymentservice.domain.model.PaymentStatus;
import com.uit.paymentservice.domain.repository.PaymentRepository;
import com.uit.paymentservice.presentation.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/payments")
@Tag(name = "Admin — Payments", description = "Admin-only payment management endpoints")
public class AdminPaymentController {

    private final AdminListPaymentsQueryHandler listPaymentsHandler;
    private final AdminPaymentStatisticsQueryHandler statisticsHandler;
    private final RefundPaymentCommand refundCommand;
    private final CheckPaymentTimeoutsCommand timeoutCommand;
    private final PaymentRepository paymentRepository;

    public AdminPaymentController(
            AdminListPaymentsQueryHandler listPaymentsHandler,
            AdminPaymentStatisticsQueryHandler statisticsHandler,
            RefundPaymentCommand refundCommand,
            CheckPaymentTimeoutsCommand timeoutCommand,
            PaymentRepository paymentRepository) {
        this.listPaymentsHandler = listPaymentsHandler;
        this.statisticsHandler = statisticsHandler;
        this.refundCommand = refundCommand;
        this.timeoutCommand = timeoutCommand;
        this.paymentRepository = paymentRepository;
    }

    @Operation(summary = "List payments (admin)")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminListPaymentsQueryHandler.PaymentSummary>>> listPayments(
            @Parameter(description = "Filter by status", example = "SUCCESS")
            @RequestParam(required = false) PaymentStatus status,
            @Parameter(description = "Filter by gateway", example = "MOMO")
            @RequestParam(required = false) PaymentGatewayType gatewayType,
            @Parameter(description = "From date (yyyy-MM-dd)", example = "2026-01-01")
            @RequestParam(required = false) @DateTimeFormat LocalDate fromDate,
            @Parameter(description = "To date (yyyy-MM-dd)", example = "2026-12-31")
            @RequestParam(required = false) @DateTimeFormat LocalDate toDate,
            @Parameter(description = "Filter by user ID")
            @RequestParam(required = false) Long userId,
            @Parameter(description = "Filter by order ID")
            @RequestParam(required = false) Long orderId,
            Pageable pageable) {

        var filter = new AdminListPaymentsQueryHandler.PaymentFilter(
            status, gatewayType, fromDate, toDate, userId, orderId);
        Page<AdminListPaymentsQueryHandler.PaymentSummary> result =
            listPaymentsHandler.execute(filter, pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "Get payment by ID (admin)")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminListPaymentsQueryHandler.PaymentSummary>> getPayment(
            @Parameter(description = "Payment transaction ID", example = "1")
            @PathVariable Long id) {

        var tx = paymentRepository.findById(id)
            .orElseThrow(() -> new com.uit.paymentservice.application.exception.PaymentNotFoundException(
                "Payment not found: " + id));
        return ResponseEntity.ok(ApiResponse.success(toSummary(tx)));
    }

    @Operation(summary = "Refund a payment")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Refund initiated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Payment not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Invalid state transition")
    })
    @PostMapping("/{id}/refund")
    public ResponseEntity<ApiResponse<String>> refundPayment(
            @Parameter(description = "Payment transaction ID", example = "1")
            @PathVariable Long id,
            @Valid @RequestBody RefundRequest request) {

        refundCommand.execute(id, request.refundAmount(), request.reason());
        return ResponseEntity.ok(ApiResponse.success("Refund processed successfully"));
    }

    @Operation(summary = "Manually trigger timeout sweep")
    @PostMapping("/check-timeouts")
    public ResponseEntity<ApiResponse<String>> checkTimeouts() {
        timeoutCommand.execute();
        return ResponseEntity.ok(ApiResponse.success("Timeout sweep completed"));
    }

    @Operation(summary = "Get payment statistics")
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<AdminPaymentStatisticsQueryHandler.PaymentStatistics>> getStatistics(
            @Parameter(description = "From date", example = "2026-01-01")
            @RequestParam(required = false) @DateTimeFormat LocalDate fromDate,
            @Parameter(description = "To date", example = "2026-12-31")
            @RequestParam(required = false) @DateTimeFormat LocalDate toDate) {

        var stats = statisticsHandler.execute(fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    private AdminListPaymentsQueryHandler.PaymentSummary toSummary(
            com.uit.paymentservice.domain.model.PaymentTransaction tx) {
        return new AdminListPaymentsQueryHandler.PaymentSummary(
            tx.getId(), tx.getOrderId(), tx.getUserId(),
            tx.getAmount(), tx.getCurrency(),
            tx.getGatewayType().name(), tx.getStatus().name(),
            tx.getGatewayTransactionId(), tx.getFailureReason(),
            tx.getCreatedAt(), tx.getUpdatedAt(), tx.getExpiredAt()
        );
    }
}
