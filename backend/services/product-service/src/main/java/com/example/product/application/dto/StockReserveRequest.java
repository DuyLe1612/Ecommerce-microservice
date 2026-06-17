package com.example.product.application.dto;

import lombok.Data;

@Data
public class StockReserveRequest {
    private Long variantId;
    private Long orderId;
    private int quantity;
}
