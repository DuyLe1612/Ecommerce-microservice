package com.uit.paymentservice.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Available payment gateway information")
public record GatewayInfo(

    @Schema(description = "Gateway type identifier", example = "MOMO")
    String type,

    @Schema(description = "Human-readable gateway name", example = "MoMo e-wallet")
    String displayName,

    @Schema(description = "Brief description of the gateway", example = "Vietnamese e-wallet with QR payment")
    String description,

    @Schema(description = "Whether this is a mock simulator (not a real gateway)", example = "true")
    boolean isMock
) {}
