package com.uit.orderservice.domain.repository;

import com.uit.orderservice.domain.model.Order;
import com.uit.orderservice.domain.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository {
    Order save(Order order);
    Optional<Order> findById(Long id);
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByUserId(String userId);
    Page<Order> findByUserId(String userId, Pageable pageable);
    List<Order> findByStatus(OrderStatus status);
    Page<Order> findAll(OrderStatus status, String userId, LocalDateTime fromDate, LocalDateTime toDate, Pageable pageable);
    boolean hasDeliveredOrderWithProduct(String userId, Long productId);
}
