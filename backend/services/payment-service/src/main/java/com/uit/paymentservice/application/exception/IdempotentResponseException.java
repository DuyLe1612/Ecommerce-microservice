package com.uit.paymentservice.application.exception;

import com.uit.paymentservice.domain.model.PaymentTransaction;

public class IdempotentResponseException extends RuntimeException {
    private final PaymentTransaction existingTransaction;

    public IdempotentResponseException(PaymentTransaction transaction) {
        super("Idempotent response for existing transaction");
        this.existingTransaction = transaction;
    }

    public PaymentTransaction getExistingTransaction() {
        return existingTransaction;
    }
}
