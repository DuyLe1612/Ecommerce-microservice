package com.uit.paymentservice.presentation.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "Standard API response wrapper")
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(

    @Schema(description = "Whether the request was successful", example = "true")
    boolean success,

    @Schema(description = "Response payload (present on success)")
    T data,

    @Schema(description = "Error details (present on failure)")
    ErrorInfo error,

    @Schema(description = "Server timestamp", example = "2026-06-14T19:00:00")
    LocalDateTime timestamp
) {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null, LocalDateTime.now());
    }

    public static <T> ApiResponse<T> error(String code, String message) {
        return new ApiResponse<>(false, null, new ErrorInfo(code, message), LocalDateTime.now());
    }

    @Schema(description = "Error information when success=false")
    public record ErrorInfo(
        @Schema(description = "Machine-readable error code", example = "ORDER_NOT_FOUND")
        String code,

        @Schema(description = "Human-readable error message", example = "Order with ID 123 not found")
        String message
    ) {}
}
