package com.example.promotion.infrastructure.config;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    
    public static final String EXCHANGE_NAME = "promotion.events";

    @Bean
    public TopicExchange promotionExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }
}
