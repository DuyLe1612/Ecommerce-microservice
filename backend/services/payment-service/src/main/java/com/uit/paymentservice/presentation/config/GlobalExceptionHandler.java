package com.uit.paymentservice.presentation.config;

import com.uit.paymentservice.application.exception.*;
import com.uit.paymentservice.infrastructure.external.MockAuthServiceClient.AuthenticationException;
import com.uit.paymentservice.infrastructure.external.RealAuthServiceClient.AuthServiceUnavailableException;
import com.uit.paymentservice.infrastructure.external.RealOrderServiceClient.OrderServiceUnavailableException;
import com.uit.paymentservice.presentation.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(IdempotentResponseException.class)
    public ResponseEntity<ApiResponse<Object>> handleIdempotentResponse(IdempotentResponseException ex) {
        log.info("Idempotent response: {}", ex.getMessage());
        return ResponseEntity.ok(ApiResponse.error("IDEMPOTENT_RESPONSE", ex.getMessage()));
    }

    @ExceptionHandler(OrderNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleOrderNotFound(OrderNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error("ORDER_NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(UnauthorizedOrderAccessException.class)
    public ResponseEntity<ApiResponse<Object>> handleUnauthorizedOrderAccess(UnauthorizedOrderAccessException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(ApiResponse.error("ORDER_USER_MISMATCH", ex.getMessage()));
    }

    @ExceptionHandler(PaymentAmountMismatchException.class)
    public ResponseEntity<ApiResponse<Object>> handlePaymentAmountMismatch(PaymentAmountMismatchException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error("PAYMENT_AMOUNT_MISMATCH", ex.getMessage()));
    }

    @ExceptionHandler(PaymentNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handlePaymentNotFound(PaymentNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error("PAYMENT_NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(InvalidSignatureException.class)
    public ResponseEntity<ApiResponse<Object>> handleInvalidSignature(InvalidSignatureException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error("INVALID_SIGNATURE", "Signature verification failed"));
    }

    @ExceptionHandler(UnsupportedGatewayException.class)
    public ResponseEntity<ApiResponse<Object>> handleUnsupportedGateway(UnsupportedGatewayException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error("UNSUPPORTED_GATEWAY", ex.getMessage()));
    }

    @ExceptionHandler(InvalidPaymentStateException.class)
    public ResponseEntity<ApiResponse<Object>> handleInvalidPaymentState(InvalidPaymentStateException ex) {
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
            .body(ApiResponse.error("INVALID_STATE_TRANSITION", ex.getMessage()));
    }

    @ExceptionHandler(GatewaySimulationException.class)
    public ResponseEntity<ApiResponse<Object>> handleGatewaySimulationError(GatewaySimulationException ex) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
            .body(ApiResponse.error("GATEWAY_SIMULATION_ERROR", ex.getMessage()));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Object>> handleAuthenticationException(AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(ApiResponse.error("UNAUTHORIZED", ex.getMessage()));
    }

    @ExceptionHandler(AuthServiceUnavailableException.class)
    public ResponseEntity<ApiResponse<Object>> handleAuthServiceUnavailable(AuthServiceUnavailableException ex) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
            .body(ApiResponse.error("AUTH_SERVICE_UNAVAILABLE", ex.getMessage()));
    }

    @ExceptionHandler(OrderServiceUnavailableException.class)
    public ResponseEntity<ApiResponse<Object>> handleOrderServiceUnavailable(OrderServiceUnavailableException ex) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
            .body(ApiResponse.error("ORDER_SERVICE_UNAVAILABLE", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationException(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .reduce((a, b) -> a + ", " + b)
            .orElse("Validation failed");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error("VALIDATION_ERROR", message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGenericException(Exception ex) {
        log.error("Unexpected error", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error("INTERNAL_ERROR", "An unexpected error occurred"));
    }
}
