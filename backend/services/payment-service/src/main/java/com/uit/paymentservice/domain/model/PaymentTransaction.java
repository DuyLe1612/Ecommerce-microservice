package com.uit.paymentservice.domain.model;

import com.uit.paymentservice.domain.event.PaymentEvent;
import com.uit.paymentservice.domain.event.PaymentFailedEvent;
import com.uit.paymentservice.domain.event.PaymentInitiatedEvent;
import com.uit.paymentservice.domain.event.PaymentRefundedEvent;
import com.uit.paymentservice.domain.event.PaymentSucceededEvent;
import com.uit.paymentservice.domain.event.PaymentTimedOutEvent;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class PaymentTransaction {

    private Long id;
    private Long orderId;
    private Long userId;
    private BigDecimal amount;
    private String currency;
    private PaymentGatewayType gatewayType;
    private PaymentStatus status;
    private String idempotencyKey;
    private String gatewayTransactionId;
    private String simulatedRedirectUrl;
    private String gatewayRawResponse;
    private String failureReason;
    private int retryCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime expiredAt;

    private final List<PaymentEvent> domainEvents = new ArrayList<>();

    protected PaymentTransaction() {}

    public static PaymentTransaction create(Long orderId, Long userId, BigDecimal amount,
            String currency, PaymentGatewayType gatewayType, String idempotencyKey, LocalDateTime expiredAt) {
        PaymentTransaction tx = new PaymentTransaction();
        tx.orderId = orderId;
        tx.userId = userId;
        tx.amount = amount;
        tx.currency = currency;
        tx.gatewayType = gatewayType;
        tx.status = PaymentStatus.PENDING;
        tx.idempotencyKey = idempotencyKey;
        tx.retryCount = 0;
        tx.createdAt = LocalDateTime.now();
        tx.updatedAt = LocalDateTime.now();
        tx.expiredAt = expiredAt;
        return tx;
    }

    public void markProcessing(String simulatedRedirectUrl) {
        if (this.status != PaymentStatus.PENDING) {
            throw new IllegalStateException(
                "Cannot transition from " + this.status + " to PROCESSING");
        }
        this.status = PaymentStatus.PROCESSING;
        this.simulatedRedirectUrl = simulatedRedirectUrl;
        this.updatedAt = LocalDateTime.now();
    }

    public void markSuccess(String gatewayTxId, String rawResponse) {
        if (this.status != PaymentStatus.PROCESSING) {
            throw new IllegalStateException(
                "Cannot transition from " + this.status + " to SUCCESS");
        }
        this.status = PaymentStatus.SUCCESS;
        this.gatewayTransactionId = gatewayTxId;
        this.gatewayRawResponse = rawResponse;
        this.updatedAt = LocalDateTime.now();
        addDomainEvent(new PaymentSucceededEvent(
            idempotencyKey, orderId, userId, gatewayType, amount, currency, gatewayTxId));
    }

    public void markFailed(String reason) {
        if (this.status != PaymentStatus.PENDING && this.status != PaymentStatus.PROCESSING) {
            throw new IllegalStateException(
                "Cannot transition from " + this.status + " to FAILED");
        }
        this.status = PaymentStatus.FAILED;
        this.failureReason = reason;
        this.updatedAt = LocalDateTime.now();
        addDomainEvent(new PaymentFailedEvent(
            idempotencyKey, orderId, userId, gatewayType, reason));
    }

    public void markTimedOut() {
        if (this.status != PaymentStatus.PROCESSING) {
            throw new IllegalStateException(
                "Cannot transition from " + this.status + " to TIMEOUT");
        }
        this.status = PaymentStatus.TIMEOUT;
        this.updatedAt = LocalDateTime.now();
        addDomainEvent(new PaymentTimedOutEvent(
            idempotencyKey, orderId, userId, gatewayType));
    }

    public void markRefunded() {
        if (this.status != PaymentStatus.SUCCESS) {
            throw new IllegalStateException(
                "Cannot transition from " + this.status + " to REFUNDED");
        }
        this.status = PaymentStatus.REFUNDED;
        this.updatedAt = LocalDateTime.now();
        addDomainEvent(new PaymentRefundedEvent(
            idempotencyKey, orderId, userId, gatewayType, amount, currency));
    }

    public boolean canRetry() {
        return retryCount < 3 && status == PaymentStatus.FAILED;
    }

    public void incrementRetry() {
        this.retryCount++;
    }

    public void addDomainEvent(PaymentEvent event) {
        this.domainEvents.add(event);
    }

    public List<PaymentEvent> getDomainEvents() {
        return List.copyOf(domainEvents);
    }

    public void clearDomainEvents() {
        this.domainEvents.clear();
    }

    // Getters
    public Long getId() { return id; }
    public Long getOrderId() { return orderId; }
    public Long getUserId() { return userId; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public PaymentGatewayType getGatewayType() { return gatewayType; }
    public PaymentStatus getStatus() { return status; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public String getGatewayTransactionId() { return gatewayTransactionId; }
    public String getSimulatedRedirectUrl() { return simulatedRedirectUrl; }
    public String getGatewayRawResponse() { return gatewayRawResponse; }
    public String getFailureReason() { return failureReason; }
    public int getRetryCount() { return retryCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public LocalDateTime getExpiredAt() { return expiredAt; }

    // Setters for JPA
    public void setId(Long id) { this.id = id; }
    public void setGatewayTransactionId(String gatewayTransactionId) {
        this.gatewayTransactionId = gatewayTransactionId;
    }
    public void setGatewayRawResponse(String gatewayRawResponse) {
        this.gatewayRawResponse = gatewayRawResponse;
    }
}
