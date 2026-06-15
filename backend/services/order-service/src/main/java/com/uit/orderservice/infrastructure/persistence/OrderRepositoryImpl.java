package com.uit.orderservice.infrastructure.persistence;

import com.uit.orderservice.domain.model.Order;
import com.uit.orderservice.domain.model.OrderStatus;
import com.uit.orderservice.domain.model.ShippingAddress;
import com.uit.orderservice.domain.repository.OrderRepository;
import com.uit.orderservice.infrastructure.persistence.entity.OrderJpaEntity;
import com.uit.orderservice.infrastructure.persistence.entity.OrderItemJpaEntity;
import com.uit.orderservice.infrastructure.persistence.OrderJpaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Transactional
public class OrderRepositoryImpl implements OrderRepository {

    private final OrderJpaRepository jpaRepository;

    public OrderRepositoryImpl(OrderJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Order save(Order order) {
        OrderJpaEntity entity = toEntity(order);
        entity = jpaRepository.save(entity);
        order.setId(entity.getId());
        order.setOrderNumber(entity.getOrderNumber());
        order.setCreatedAt(entity.getCreatedAt());
        order.setUpdatedAt(entity.getUpdatedAt());
        return order;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Order> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Order> findByOrderNumber(String orderNumber) {
        return jpaRepository.findByOrderNumber(orderNumber).map(this::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> findByUserId(Long userId) {
        return jpaRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream().map(this::toDomain).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> findByStatus(OrderStatus status) {
        return jpaRepository.findByStatus(status)
            .stream().map(this::toDomain).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasDeliveredOrderWithProduct(Long userId, Long productId) {
        return jpaRepository.existsDeliveredOrderWithProduct(userId, productId);
    }

    private OrderJpaEntity toEntity(Order order) {
        OrderJpaEntity e = new OrderJpaEntity();
        if (order.getId() != null) e.setId(order.getId());
        e.setOrderNumber(order.getOrderNumber());
        e.setUserId(order.getUserId());
        e.setStatus(order.getStatus());
        e.setSubtotalAmount(order.getSubtotal().amount());
        e.setSubtotalCurrency(order.getSubtotal().currency());
        e.setDiscountAmount(order.getDiscount().amount());
        e.setDiscountCurrency(order.getDiscount().currency());
        e.setShippingFeeAmount(order.getShippingFee().amount());
        e.setShippingFeeCurrency(order.getShippingFee().currency());
        e.setTotalAmount(order.getTotalAmount().amount());
        e.setTotalCurrency(order.getTotalAmount().currency());
        e.setCouponCode(order.getCouponCode());
        e.setCouponId(order.getCouponId());
        e.setNotes(order.getNotes());
        if (order.getShippingAddress() != null) {
            e.setShippingRecipientName(order.getShippingAddress().recipientName());
            e.setShippingPhone(order.getShippingAddress().phone());
            e.setShippingStreetAddress(order.getShippingAddress().streetAddress());
            e.setShippingCity(order.getShippingAddress().city());
            e.setShippingDistrict(order.getShippingAddress().district());
            e.setShippingWard(order.getShippingAddress().ward());
            e.setShippingPostalCode(order.getShippingAddress().postalCode());
        }
        // Persist order items
        for (com.uit.orderservice.domain.model.OrderItem item : order.getItems()) {
            OrderItemJpaEntity itemEntity = new OrderItemJpaEntity();
            itemEntity.setProductId(item.productId());
            itemEntity.setProductName(item.productName());
            itemEntity.setQuantity(item.quantity());
            itemEntity.setUnitPrice(item.unitPrice());
            itemEntity.setSubtotal(item.subtotal());
            e.addItem(itemEntity);
        }
        return e;
    }

    private Order toDomain(OrderJpaEntity e) {
        ShippingAddress addr = null;
        if (e.getShippingRecipientName() != null) {
            addr = new ShippingAddress(
                e.getShippingRecipientName(),
                e.getShippingPhone(),
                e.getShippingStreetAddress(),
                e.getShippingCity(),
                e.getShippingDistrict(),
                e.getShippingWard(),
                e.getShippingPostalCode()
            );
        }
        return Order.fromJpaEntity(
            e.getId(), e.getOrderNumber(), e.getUserId(), e.getStatus(),
            new com.uit.orderservice.domain.model.Money(e.getSubtotalAmount(), e.getSubtotalCurrency()),
            new com.uit.orderservice.domain.model.Money(e.getDiscountAmount(), e.getDiscountCurrency()),
            new com.uit.orderservice.domain.model.Money(e.getShippingFeeAmount(), e.getShippingFeeCurrency()),
            new com.uit.orderservice.domain.model.Money(e.getTotalAmount(), e.getTotalCurrency()),
            e.getCouponCode(), e.getCouponId(), e.getNotes(),
            addr,
            e.getCreatedAt(), e.getUpdatedAt(),
            e.getItems().stream()
                .map(ie -> new com.uit.orderservice.domain.model.OrderItem(
                    ie.getProductId(), ie.getProductName(),
                    ie.getQuantity(), ie.getUnitPrice(), ie.getSubtotal()))
                .toList()
        );
    }
}
