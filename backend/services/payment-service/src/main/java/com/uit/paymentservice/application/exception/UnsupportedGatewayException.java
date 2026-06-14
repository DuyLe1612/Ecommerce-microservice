package com.uit.paymentservice.application.exception;

public class UnsupportedGatewayException extends RuntimeException {
    public UnsupportedGatewayException(String message) {
        super(message);
    }
}
