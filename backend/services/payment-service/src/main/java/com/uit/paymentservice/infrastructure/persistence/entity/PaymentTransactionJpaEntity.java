package com.uit.paymentservice.infrastructure.persistence.entity;

import com.uit.paymentservice.domain.model.PaymentGatewayType;
import com.uit.paymentservice.domain.model.PaymentStatus;
import com.uit.paymentservice.domain.model.PaymentTransaction;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transaction")
public class PaymentTransactionJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", nullable = false, length = 10)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(name = "gateway_type", nullable = false, length = 30)
    private PaymentGatewayType gatewayType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PaymentStatus status;

    @Column(name = "idempotency_key", nullable = false, unique = true, length = 100)
    private String idempotencyKey;

    @Column(name = "gateway_transaction_id", unique = true, length = 200)
    private String gatewayTransactionId;

    @Column(name = "simulated_redirect_url", columnDefinition = "TEXT")
    private String simulatedRedirectUrl;

    @Column(name = "gateway_raw_response", columnDefinition = "TEXT")
    private String gatewayRawResponse;

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    @Column(name = "retry_count", nullable = false)
    private int retryCount;

    @Column(name = "expired_at")
    private LocalDateTime expiredAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public static PaymentTransactionJpaEntity fromDomain(PaymentTransaction tx) {
        PaymentTransactionJpaEntity entity = new PaymentTransactionJpaEntity();
        entity.id = tx.getId();
        entity.orderId = tx.getOrderId();
        entity.userId = tx.getUserId();
        entity.amount = tx.getAmount();
        entity.currency = tx.getCurrency();
        entity.gatewayType = tx.getGatewayType();
        entity.status = tx.getStatus();
        entity.idempotencyKey = tx.getIdempotencyKey();
        entity.gatewayTransactionId = tx.getGatewayTransactionId();
        entity.simulatedRedirectUrl = tx.getSimulatedRedirectUrl();
        entity.gatewayRawResponse = tx.getGatewayRawResponse();
        entity.failureReason = tx.getFailureReason();
        entity.retryCount = tx.getRetryCount();
        entity.expiredAt = tx.getExpiredAt();
        entity.createdAt = tx.getCreatedAt();
        entity.updatedAt = tx.getUpdatedAt();
        return entity;
    }

    public PaymentTransaction toDomain() {
        PaymentTransaction tx = PaymentTransaction.create(
            orderId, userId, amount, currency, gatewayType,status, idempotencyKey, expiredAt
        );
        tx.setId(id);
        tx.setGatewayTransactionId(gatewayTransactionId);
        tx.setGatewayRawResponse(gatewayRawResponse);
        return tx;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public LocalDateTime getExpiredAt() { return expiredAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
