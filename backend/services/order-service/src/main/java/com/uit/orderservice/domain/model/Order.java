package com.uit.orderservice.domain.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class Order {

    private Long id;
    private String orderNumber;
    private Long userId;
    private OrderStatus status;
    private List<OrderItem> items = new ArrayList<>();
    private ShippingAddress shippingAddress;
    private Money subtotal;
    private Money discount;
    private Money shippingFee;
    private Money totalAmount;
    private String couponCode;
    private Long couponId;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private final List<Object> domainEvents = new ArrayList<>();

    protected Order() {}

    public static Order create(Long userId, List<OrderItem> items, ShippingAddress shippingAddress,
                               Money subtotal, Money discount, Money shippingFee,
                               String couponCode, Long couponId, String notes) {
        Order order = new Order();
        order.orderNumber = generateOrderNumber();
        order.userId = userId;
        order.status = OrderStatus.PENDING_PAYMENT;
        order.items = new ArrayList<>(items);
        order.shippingAddress = shippingAddress;
        order.subtotal = subtotal;
        order.discount = discount;
        order.shippingFee = shippingFee;
        order.totalAmount = new Money(
            subtotal.amount().add(shippingFee.amount()).subtract(discount.amount()),
            subtotal.currency()
        );
        order.couponCode = couponCode;
        order.couponId = couponId;
        order.notes = notes;
        order.createdAt = LocalDateTime.now();
        order.updatedAt = LocalDateTime.now();
        return order;
    }

    public void markPaid() {
        if (!status.canTransitionTo(OrderStatus.PAID)) {
            throw new IllegalStateException("Cannot transition from " + status + " to PAID");
        }
        this.status = OrderStatus.PAID;
        this.updatedAt = LocalDateTime.now();
    }

    public void markCancelled(String reason) {
        if (!status.canTransitionTo(OrderStatus.CANCELLED)) {
            throw new IllegalStateException("Cannot transition from " + status + " to CANCELLED");
        }
        this.status = OrderStatus.CANCELLED;
        this.notes = (this.notes != null ? this.notes + "; " : "") + "Cancelled: " + reason;
        this.updatedAt = LocalDateTime.now();
    }

    public void markProcessing() {
        if (!status.canTransitionTo(OrderStatus.PROCESSING)) {
            throw new IllegalStateException("Cannot transition from " + status + " to PROCESSING");
        }
        this.status = OrderStatus.PROCESSING;
        this.updatedAt = LocalDateTime.now();
    }

    public void markShipping() {
        if (!status.canTransitionTo(OrderStatus.SHIPPING)) {
            throw new IllegalStateException("Cannot transition from " + status + " to SHIPPING");
        }
        this.status = OrderStatus.SHIPPING;
        this.updatedAt = LocalDateTime.now();
    }

    public void markDelivered() {
        if (!status.canTransitionTo(OrderStatus.DELIVERED)) {
            throw new IllegalStateException("Cannot transition from " + status + " to DELIVERED");
        }
        this.status = OrderStatus.DELIVERED;
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isOwnedBy(Long userId) {
        return this.userId.equals(userId);
    }

    // Public: used by OrderRepositoryImpl to reconstruct from JPA entity
    public static Order fromJpaEntity(
            Long id, String orderNumber, Long userId, OrderStatus status,
            Money subtotal, Money discount, Money shippingFee, Money totalAmount,
            String couponCode, Long couponId, String notes,
            ShippingAddress address, LocalDateTime createdAt, LocalDateTime updatedAt,
            List<OrderItem> items) {
        Order o = new Order();
        o.id = id;
        o.orderNumber = orderNumber;
        o.userId = userId;
        o.status = status;
        o.subtotal = subtotal;
        o.discount = discount;
        o.shippingFee = shippingFee;
        o.totalAmount = totalAmount;
        o.couponCode = couponCode;
        o.couponId = couponId;
        o.notes = notes;
        o.shippingAddress = address;
        o.createdAt = createdAt;
        o.updatedAt = updatedAt;
        o.items = new ArrayList<>(items);
        return o;
    }

    // Getters
    public Long getId() { return id; }
    public String getOrderNumber() { return orderNumber; }
    public Long getUserId() { return userId; }
    public OrderStatus getStatus() { return status; }
    public List<OrderItem> getItems() { return List.copyOf(items); }
    public ShippingAddress getShippingAddress() { return shippingAddress; }
    public Money getSubtotal() { return subtotal; }
    public Money getDiscount() { return discount; }
    public Money getShippingFee() { return shippingFee; }
    public Money getTotalAmount() { return totalAmount; }
    public String getCouponCode() { return couponCode; }
    public Long getCouponId() { return couponId; }
    public String getNotes() { return notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // Setters for JPA
    public void setId(Long id) { this.id = id; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setStatus(OrderStatus status) { this.status = status; }
    public void setShippingAddress(ShippingAddress address) { this.shippingAddress = address; }
    public void setSubtotal(Money subtotal) { this.subtotal = subtotal; }
    public void setDiscount(Money discount) { this.discount = discount; }
    public void setShippingFee(Money shippingFee) { this.shippingFee = shippingFee; }
    public void setTotalAmount(Money totalAmount) { this.totalAmount = totalAmount; }
    public void setNotes(String notes) { this.notes = notes; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    private static String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 900 + 100);
    }
}
