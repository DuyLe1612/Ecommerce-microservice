package com.uit.orderservice.presentation.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import com.uit.orderservice.application.exception.ProductServiceUnavailableException;
import com.uit.orderservice.application.exception.ProductValidationException;
import com.uit.orderservice.application.service.OrderService.OrderNotFoundException;
import com.uit.orderservice.application.service.OrderService.UnauthorizedOrderAccessException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(OrderNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(OrderNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("success", false, "code", "ORDER_NOT_FOUND", "message", ex.getMessage()));
    }

    @ExceptionHandler(UnauthorizedOrderAccessException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorized(UnauthorizedOrderAccessException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(Map.of("success", false, "code", "UNAUTHORIZED", "message", ex.getMessage()));
    }

    @ExceptionHandler(ProductValidationException.class)
    public ResponseEntity<Map<String, Object>> handleProductValidation(ProductValidationException ex) {
        List<Map<String, Object>> failedItems = ex.getFailedItems().stream()
            .map(f -> Map.<String, Object>of(
                "productId", f.productId(),
                "exists", f.exists(),
                "inStock", f.inStock(),
                "availableStock", f.availableStock(),
                "requestedQuantity", f.requestedQuantity(),
                "error", f.error() != null ? f.error() : ""
            ))
            .collect(Collectors.toList());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(Map.of(
                "success", false,
                "code", "PRODUCT_VALIDATION_FAILED",
                "message", ex.getMessage(),
                "failedItems", failedItems
            ));
    }

    @ExceptionHandler(ProductServiceUnavailableException.class)
    public ResponseEntity<Map<String, Object>> handleProductServiceUnavailable(ProductServiceUnavailableException ex) {
        log.error("Product service unavailable: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
            .body(Map.of("success", false, "code", "PRODUCT_SERVICE_UNAVAILABLE", "message", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .reduce((a, b) -> a + ", " + b)
            .orElse("Validation failed");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(Map.of("success", false, "code", "VALIDATION_ERROR", "message", message));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
            .body(Map.of("success", false, "code", "INVALID_STATE_TRANSITION", "message", ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        log.error("Unexpected error", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("success", false, "code", "INTERNAL_ERROR", "message", "An unexpected error occurred"));
    }
}
