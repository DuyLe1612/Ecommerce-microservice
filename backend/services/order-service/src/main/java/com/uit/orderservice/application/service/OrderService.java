package com.uit.orderservice.application.service;

import com.uit.orderservice.application.dto.CreateOrderRequest;
import com.uit.orderservice.application.dto.OrderResponse;
import com.uit.orderservice.application.exception.ProductServiceUnavailableException;
import com.uit.orderservice.application.exception.ProductValidationException;
import com.uit.orderservice.domain.event.*;
import com.uit.orderservice.domain.model.*;
import com.uit.orderservice.domain.repository.OrderRepository;
import com.uit.orderservice.infrastructure.external.ProductServiceClient;
import com.uit.orderservice.infrastructure.messaging.OrderEventPublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final OrderEventPublisher eventPublisher;
    private final ProductServiceClient productServiceClient;

    public OrderService(
            OrderRepository orderRepository,
            OrderEventPublisher eventPublisher,
            ProductServiceClient productServiceClient) {
        this.orderRepository = orderRepository;
        this.eventPublisher = eventPublisher;
        this.productServiceClient = productServiceClient;
    }

    public OrderResponse createOrder(CreateOrderRequest request) {
        log.info("Creating order for userId={}", request.userId());

        // Step 1: Validate all order items against product-service
        validateOrderItems(request.items());

        List<OrderItem> items = request.items().stream()
            .map(i -> new OrderItem(i.productId(), i.productName(), i.quantity(), i.unitPrice(), i.subtotal()))
            .toList();

        ShippingAddress address = new ShippingAddress(
            request.shippingAddress().recipientName(),
            request.shippingAddress().phone(),
            request.shippingAddress().streetAddress(),
            request.shippingAddress().city(),
            request.shippingAddress().district(),
            request.shippingAddress().ward(),
            request.shippingAddress().postalCode()
        );

        Money subtotal = new Money(request.subtotal(), request.currency());
        Money discount = new Money(request.discountAmount(), request.currency());
        Money shippingFee = new Money(request.shippingFee(), request.currency());

        Order order = Order.create(
            request.userId(), items, address,
            subtotal, discount, shippingFee,
            request.couponCode(), request.couponId(),
            request.notes()
        );

        order = orderRepository.save(order);
        log.info("Order created: id={}, orderNumber={}", order.getId(), order.getOrderNumber());

        eventPublisher.publish(new OrderCreatedEvent(
            order.getId(), order.getOrderNumber(), order.getUserId(),
            order.getTotalAmount().amount(), order.getTotalAmount().currency(),
            order.getCouponCode()
        ));

        return toResponse(order);
    }

    private void validateOrderItems(List<CreateOrderRequest.ItemRequest> items) {
        List<ProductServiceClient.ProductItemRequest> productRequests = items.stream()
            .map(i -> new ProductServiceClient.ProductItemRequest(i.productId(), i.quantity()))
            .toList();

        log.info("Validating {} order items against product-service", productRequests.size());

        ProductServiceClient.BatchProductValidationResult result =
            productServiceClient.validateItems(productRequests);

        if (!result.allValid()) {
            List<ProductServiceClient.ItemValidationResult> failures = result.results().stream()
                .filter(r -> !r.valid())
                .toList();

            log.warn("Product validation failed for {} items: {}", failures.size(), failures);

            failures.forEach(f -> {
                if (!f.exists()) {
                    log.error("Product variant not found: productId={}", f.productId());
                } else if (!f.inStock()) {
                    log.error("Insufficient stock for productId={}: requested={}, available={}",
                        f.productId(), f.requestedQuantity(), f.availableStock());
                }
            });

            throw new ProductValidationException(
                "One or more order items failed product validation", failures);
        }

        log.info("All {} order items validated successfully", items.size());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
            .map(this::toResponse)
            .orElseThrow(() -> new OrderNotFoundException(orderNumber));
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
            .map(this::toResponse)
            .orElseThrow(() -> new OrderNotFoundException(orderId));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrderHistory(Long userId) {
        return orderRepository.findByUserId(userId).stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId, Long userId, String reason) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));

        if (!order.isOwnedBy(userId)) {
            throw new UnauthorizedOrderAccessException(
                "User " + userId + " does not own order " + orderId);
        }

        order.markCancelled(reason != null ? reason : "Cancelled by customer");
        order = orderRepository.save(order);

        eventPublisher.publish(new OrderCancelledEvent(
            order.getId(), order.getOrderNumber(), order.getUserId(), reason));
        log.info("Order {} cancelled by user {}", orderId, userId);

        return toResponse(order);
    }

    @Transactional
    public OrderResponse shipOrder(Long orderId, String trackingNumber) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));

        order.markShipping();
        order.setNotes((order.getNotes() != null ? order.getNotes() + "; " : "") +
            "Tracking: " + trackingNumber);
        order = orderRepository.save(order);

        eventPublisher.publish(new OrderShippedEvent(
            order.getId(), order.getOrderNumber(), order.getUserId(), trackingNumber));
        log.info("Order {} shipped with tracking {}", orderId, trackingNumber);

        return toResponse(order);
    }

    @Transactional
    public OrderResponse deliverOrder(Long orderId, String recipientSignature) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));

        order.markDelivered();
        order = orderRepository.save(order);

        eventPublisher.publish(new OrderDeliveredEvent(
            order.getId(), order.getOrderNumber(), order.getUserId(), recipientSignature));
        eventPublisher.publish(new OrderCompletedEvent(
            order.getId(), order.getOrderNumber(), order.getUserId()));

        log.info("Order {} delivered and completed", orderId);
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public boolean hasUserPurchasedProduct(Long userId, Long productId) {
        return orderRepository.hasDeliveredOrderWithProduct(userId, productId);
    }

    private OrderResponse toResponse(Order order) {
        return new OrderResponse(
            order.getId(),
            order.getOrderNumber(),
            order.getUserId(),
            order.getStatus().name(),
            order.getTotalAmount().amount(),
            order.getTotalAmount().currency(),
            order.getCreatedAt(),
            order.getUpdatedAt()
        );
    }

    public static class OrderNotFoundException extends RuntimeException {
        public OrderNotFoundException(String orderNumber) { super("Order not found: " + orderNumber); }
        public OrderNotFoundException(Long orderId) { super("Order not found: " + orderId); }
    }

    public static class UnauthorizedOrderAccessException extends RuntimeException {
        public UnauthorizedOrderAccessException(String msg) { super(msg); }
    }
}
