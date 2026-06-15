package com.uit.orderservice.infrastructure.messaging;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Exchange names
    public static final String ORDER_EVENTS_EXCHANGE     = "order.events";
    public static final String ORDER_EVENTS_DLX          = "order.events.dlx";

    // Routing keys
    public static final String ORDER_CREATED_KEY   = "order.created";
    public static final String ORDER_CANCELLED_KEY = "order.cancelled";
    public static final String ORDER_SHIPPED_KEY   = "order.shipped";
    public static final String ORDER_DELIVERED_KEY = "order.delivered";
    public static final String ORDER_COMPLETED_KEY = "order.completed";

    @Bean
    public TopicExchange orderEventsExchange() {
        return ExchangeBuilder.topicExchange(ORDER_EVENTS_EXCHANGE).durable(true).build();
    }

    @Bean
    public TopicExchange orderEventsDlx() {
        return ExchangeBuilder.topicExchange(ORDER_EVENTS_DLX).durable(true).build();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(new JacksonJsonMessageConverter());
        return template;
    }
}
