package com.example.search.infrastructure.messaging;

import com.example.search.domain.SearchConstants;
import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Bean
    public TopicExchange productExchange() {
        return new TopicExchange(SearchConstants.EXCHANGE_PRODUCT_EVENTS);
    }

    @Bean
    public TopicExchange promotionExchange() {
        return new TopicExchange(SearchConstants.EXCHANGE_PROMOTION_EVENTS);
    }

    @Bean
    public Queue productCreatedQueue() {
        return new Queue(SearchConstants.QUEUE_PRODUCT_CREATED);
    }

    @Bean
    public Queue productUpdatedQueue() {
        return new Queue(SearchConstants.QUEUE_PRODUCT_UPDATED);
    }

    @Bean
    public Queue productDeletedQueue() {
        return new Queue(SearchConstants.QUEUE_PRODUCT_DELETED);
    }

    @Bean
    public Queue promotionActivatedQueue() {
        return new Queue(SearchConstants.QUEUE_PROMOTION_ACTIVATED);
    }

    @Bean
    public Queue promotionPausedQueue() {
        return new Queue(SearchConstants.QUEUE_PROMOTION_PAUSED);
    }

    @Bean
    public Binding bindProductCreated(TopicExchange productExchange, Queue productCreatedQueue) {
        return BindingBuilder.bind(productCreatedQueue).to(productExchange).with(SearchConstants.ROUTING_KEY_PRODUCT_CREATED);
    }

    @Bean
    public Binding bindProductUpdated(TopicExchange productExchange, Queue productUpdatedQueue) {
        return BindingBuilder.bind(productUpdatedQueue).to(productExchange).with(SearchConstants.ROUTING_KEY_PRODUCT_UPDATED);
    }

    @Bean
    public Binding bindProductDeleted(TopicExchange productExchange, Queue productDeletedQueue) {
        return BindingBuilder.bind(productDeletedQueue).to(productExchange).with(SearchConstants.ROUTING_KEY_PRODUCT_DELETED);
    }

    @Bean
    public Binding bindPromotionActivated(TopicExchange promotionExchange, Queue promotionActivatedQueue) {
        return BindingBuilder.bind(promotionActivatedQueue).to(promotionExchange).with(SearchConstants.ROUTING_KEY_PROMOTION_ACTIVATED);
    }

    @Bean
    public Binding bindPromotionPaused(TopicExchange promotionExchange, Queue promotionPausedQueue) {
        return BindingBuilder.bind(promotionPausedQueue).to(promotionExchange).with(SearchConstants.ROUTING_KEY_PROMOTION_PAUSED);
    }

    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
