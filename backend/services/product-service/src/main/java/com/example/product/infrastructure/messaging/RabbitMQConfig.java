package com.example.product.infrastructure.messaging;

import com.example.product.domain.Constants;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Bean
    public TopicExchange productExchange() {
        return new TopicExchange(Constants.EXCHANGE_PRODUCT_EVENTS);
    }

    @Bean
    public TopicExchange catalogExchange() {
        return new TopicExchange(Constants.EXCHANGE_CATALOG_EVENTS);
    }

    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
