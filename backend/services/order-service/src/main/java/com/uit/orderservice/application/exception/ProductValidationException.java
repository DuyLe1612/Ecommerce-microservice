package com.uit.orderservice.application.exception;

import com.uit.orderservice.infrastructure.external.ProductServiceClient.ItemValidationResult;

import java.util.List;

public class ProductValidationException extends RuntimeException {

    private final List<ItemValidationResult> failedItems;

    public ProductValidationException(String message, List<ItemValidationResult> failedItems) {
        super(message);
        this.failedItems = failedItems;
    }

    public List<ItemValidationResult> getFailedItems() {
        return failedItems;
    }
}
