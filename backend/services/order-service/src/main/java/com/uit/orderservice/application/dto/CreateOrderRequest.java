package com.uit.orderservice.application.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.List;

public record CreateOrderRequest(
    @NotNull String userId,

    @NotEmpty List<@Valid ItemRequest> items,

    @NotNull @Positive BigDecimal subtotal,
    @NotNull BigDecimal discountAmount,
    @NotNull BigDecimal shippingFee,
    @NotBlank String currency,

    @Valid ShippingAddressRequest shippingAddress,

    String couponCode,
    Long couponId,
    String notes
) {
    public record ItemRequest(
        @NotNull Long productId,
        @NotBlank String productName,
        @NotNull @Positive int quantity,
        @NotNull @Positive BigDecimal unitPrice,
        @NotNull @Positive BigDecimal subtotal
    ) {}

    public record ShippingAddressRequest(
        @NotBlank String recipientName,
        @NotBlank String phone,
        @NotBlank String streetAddress,
        @NotBlank String city,
        String district,
        String ward,
        String postalCode
    ) {}
}
