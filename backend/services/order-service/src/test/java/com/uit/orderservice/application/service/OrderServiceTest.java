package com.uit.orderservice.application.service;

import com.uit.orderservice.application.dto.CreateOrderRequest;
import com.uit.orderservice.domain.model.Order;
import com.uit.orderservice.domain.repository.OrderRepository;
import com.uit.orderservice.infrastructure.external.ProductServiceClient;
import com.uit.orderservice.infrastructure.messaging.OrderEventPublisher;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class OrderServiceTest {

    @Test
    void createOrderStoresProductImageAndShippingAddressSnapshots() {
        OrderRepository orderRepository = mock(OrderRepository.class);
        OrderEventPublisher eventPublisher = mock(OrderEventPublisher.class);
        ProductServiceClient productServiceClient = mock(ProductServiceClient.class);
        OrderService orderService = new OrderService(orderRepository, eventPublisher, productServiceClient);

        when(productServiceClient.validateItems(any())).thenReturn(
            new ProductServiceClient.BatchProductValidationResult(
                true,
                List.of(new ProductServiceClient.ItemValidationResult(
                    616L,
                    true,
                    true,
                    9,
                    1,
                    new BigDecimal("8034376.00"),
                    "https://cdn.example.com/product.jpg",
                    "available",
                    null
                ))
            )
        );
        doNothing().when(productServiceClient).reserveStock(any(), any());
        doNothing().when(eventPublisher).publish(any());
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var request = new CreateOrderRequest(
            "user-1",
            List.of(new CreateOrderRequest.ItemRequest(
                616L,
                "W094 Workstation Mid-range",
                "https://frontend.example.com/fallback.jpg",
                1,
                new BigDecimal("8034376.00"),
                new BigDecimal("8034376.00")
            )),
            new BigDecimal("8034376.00"),
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            "VND",
            new CreateOrderRequest.ShippingAddressRequest(
                "Pham Ha Anh Thu",
                "0956764576",
                "Vinhomes GrandPark",
                "Ho Chi Minh",
                "Thu Duc",
                "Long Binh",
                "700000"
            ),
            null,
            null,
            "Order from cart"
        );

        var response = orderService.createOrder(request);

        assertThat(response.items()).hasSize(1);
        assertThat(response.items().get(0).productImageUrl())
            .isEqualTo("https://cdn.example.com/product.jpg");
        assertThat(response.shippingAddress()).isNotNull();
        assertThat(response.shippingAddress().recipientName()).isEqualTo("Pham Ha Anh Thu");
        assertThat(response.shippingAddress().streetAddress()).isEqualTo("Vinhomes GrandPark");
    }
}
