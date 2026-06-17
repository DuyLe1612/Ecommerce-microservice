package com.example.product.application.dto;

import lombok.Data;

@Data
public class StockAdjustRequest {
    private int delta; // positive = add, negative = subtract
    private String reason;
}
