package com.example.coupon.infrastructure.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String ORDER_EXCHANGE = "order.events";
    public static final String COUPON_ORDER_QUEUE = "coupon.order.completed.queue";

    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(ORDER_EXCHANGE);
    }

    @Bean
    public Queue couponOrderQueue() {
        return new Queue(COUPON_ORDER_QUEUE, true);
    }

    @Bean
    public Binding bindingOrderCompleted() {
        return BindingBuilder.bind(couponOrderQueue())
                .to(orderExchange())
                .with("order.completed");
    }
}
