package com.uit.orderservice.infrastructure.messaging;

import com.uit.orderservice.domain.event.OrderEvent;
import com.uit.orderservice.domain.model.OrderStatus;
import com.uit.orderservice.domain.repository.OrderRepository;
import com.uit.orderservice.infrastructure.messaging.OrderEventPublisher;
import com.uit.orderservice.domain.event.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

@Service
public class PaymentEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(PaymentEventConsumer.class);

    private final OrderRepository orderRepository;
    private final OrderEventPublisher eventPublisher;

    public PaymentEventConsumer(OrderRepository orderRepository, OrderEventPublisher eventPublisher) {
        this.orderRepository = orderRepository;
        this.eventPublisher = eventPublisher;
    }

    @RabbitListener(queues = "order-service.payment.succeeded")
    @Transactional
    public void onPaymentSucceeded(PaymentSucceededEvent event) {
        log.info("Received PaymentSucceeded: orderId={}, gateway={}", event.orderId(), event.gatewayType());
        orderRepository.findById(event.orderId()).ifPresent(order -> {
            if (order.getStatus() == OrderStatus.PENDING_PAYMENT) {
                order.markPaid();
                order.markProcessing();
                orderRepository.save(order);
                log.info("Order {} marked PAID+PROCESSING after payment success", order.getId());
            }
        });
    }

    @RabbitListener(queues = "order-service.payment.failed")
    @Transactional
    public void onPaymentFailed(PaymentFailedEvent event) {
        log.info("Received PaymentFailed: orderId={}, reason={}", event.orderId(), event.reason());
        orderRepository.findById(event.orderId()).ifPresent(order -> {
            if (order.getStatus() == OrderStatus.PENDING_PAYMENT) {
                order.markCancelled("Payment failed: " + event.reason());
                orderRepository.save(order);
                eventPublisher.publish(new OrderCancelledEvent(
                    order.getId(), order.getOrderNumber(), order.getUserId(), event.reason()));
                log.info("Order {} cancelled due to payment failure", order.getId());
            }
        });
    }

    @RabbitListener(queues = "order-service.payment.refunded")
    @Transactional
    public void onPaymentRefunded(PaymentRefundedEvent event) {
        log.info("Received PaymentRefunded: orderId={}", event.orderId());
        orderRepository.findById(event.orderId()).ifPresent(order -> {
            log.info("Payment refunded for order {}", order.getId());
        });
    }

    // Records matching the JSON shape published by payment-service
    public record PaymentSucceededEvent(
        String idempotencyKey,
        Long orderId,
        Long userId,
        String gatewayType,   // string to avoid cross-service dependency
        BigDecimal amount,
        String currency,
        String gatewayTransactionId
    ) {}

    public record PaymentFailedEvent(
        String idempotencyKey,
        Long orderId,
        Long userId,
        String gatewayType,
        String reason
    ) {}

    public record PaymentRefundedEvent(
        String idempotencyKey,
        Long orderId,
        Long userId,
        String gatewayType,
        BigDecimal refundedAmount,
        String currency
    ) {}
}
