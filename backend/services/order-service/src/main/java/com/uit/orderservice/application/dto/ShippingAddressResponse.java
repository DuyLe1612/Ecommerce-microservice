package com.uit.orderservice.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Shipping address snapshot stored with the order")
public record ShippingAddressResponse(
    @Schema(description = "Recipient name", example = "Nguyen Van A")
    String recipientName,

    @Schema(description = "Recipient phone number", example = "0900000000")
    String phone,

    @Schema(description = "Street address", example = "123 Nguyen Trai")
    String streetAddress,

    @Schema(description = "City or province", example = "Ho Chi Minh")
    String city,

    @Schema(description = "District", example = "District 1")
    String district,

    @Schema(description = "Ward", example = "Ben Nghe")
    String ward,

    @Schema(description = "Postal code", example = "700000")
    String postalCode
) {}
