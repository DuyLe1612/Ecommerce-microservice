package com.uit.orderservice.domain.model;

public record ShippingAddress(
    String recipientName,
    String phone,
    String streetAddress,
    String city,
    String district,
    String ward,
    String postalCode
) {}
