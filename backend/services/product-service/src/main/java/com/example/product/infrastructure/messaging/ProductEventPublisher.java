package com.example.product.infrastructure.messaging;

import com.example.product.domain.Constants;
import com.example.product.domain.event.ProductEventV1;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProductEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishProductCreated(ProductEventV1 event) {
        rabbitTemplate.convertAndSend(Constants.EXCHANGE_PRODUCT_EVENTS, Constants.ROUTING_KEY_PRODUCT_CREATED, event);
    }

    public void publishProductUpdated(ProductEventV1 event) {
        rabbitTemplate.convertAndSend(Constants.EXCHANGE_PRODUCT_EVENTS, Constants.ROUTING_KEY_PRODUCT_UPDATED, event);
    }

    public void publishProductDeleted(ProductEventV1 event) {
        rabbitTemplate.convertAndSend(Constants.EXCHANGE_PRODUCT_EVENTS, Constants.ROUTING_KEY_PRODUCT_DELETED, event);
    }

    public void publishCategoryUpdated(Object event) {
        rabbitTemplate.convertAndSend(Constants.EXCHANGE_CATALOG_EVENTS, Constants.ROUTING_KEY_CATEGORY_UPDATED, event);
    }
}
