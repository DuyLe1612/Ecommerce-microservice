package com.uit.orderservice.infrastructure.messaging;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PaymentEventListenerConfig {

    public static final String PAYMENT_EVENTS_EXCHANGE = "payment.events";
    public static final String PAYMENT_EVENTS_DLX = "payment.events.dlx";

    public static final String PAYMENT_SUCCEEDED_QUEUE = "order-service.payment.succeeded";
    public static final String PAYMENT_FAILED_QUEUE = "order-service.payment.failed";
    public static final String PAYMENT_REFUNDED_QUEUE = "order-service.payment.refunded";

    public static final String PAYMENT_SUCCEEDED_KEY = "payment.succeeded";
    public static final String PAYMENT_FAILED_KEY = "payment.failed";
    public static final String PAYMENT_REFUNDED_KEY = "payment.refunded";

    // EXCHANGE (reference only)
    @Bean
    public TopicExchange paymentEventsExchange() {
        return ExchangeBuilder.topicExchange(PAYMENT_EVENTS_EXCHANGE)
                .durable(true)
                .build();
    }

    @Bean
    public TopicExchange paymentEventsDlx() {
        return ExchangeBuilder.topicExchange(PAYMENT_EVENTS_DLX)
                .durable(true)
                .build();
    }

    // QUEUES
    @Bean
    public Queue paymentSucceededQueue() {
        return QueueBuilder.durable(PAYMENT_SUCCEEDED_QUEUE)
                .withArgument("x-dead-letter-exchange", PAYMENT_EVENTS_DLX)
                .build();
    }

    @Bean
    public Queue paymentFailedQueue() {
        return QueueBuilder.durable(PAYMENT_FAILED_QUEUE)
                .withArgument("x-dead-letter-exchange", PAYMENT_EVENTS_DLX)
                .build();
    }

    @Bean
    public Queue paymentRefundedQueue() {
        return QueueBuilder.durable(PAYMENT_REFUNDED_QUEUE)
                .withArgument("x-dead-letter-exchange", PAYMENT_EVENTS_DLX)
                .build();
    }

    // BINDINGS
    @Bean
    public Binding paymentSucceededBinding(Queue paymentSucceededQueue, TopicExchange paymentEventsExchange) {
        return BindingBuilder.bind(paymentSucceededQueue)
                .to(paymentEventsExchange)
                .with(PAYMENT_SUCCEEDED_KEY);
    }

    @Bean
    public Binding paymentFailedBinding(Queue paymentFailedQueue, TopicExchange paymentEventsExchange) {
        return BindingBuilder.bind(paymentFailedQueue)
                .to(paymentEventsExchange)
                .with(PAYMENT_FAILED_KEY);
    }

    @Bean
    public Binding paymentRefundedBinding(Queue paymentRefundedQueue, TopicExchange paymentEventsExchange) {
        return BindingBuilder.bind(paymentRefundedQueue)
                .to(paymentEventsExchange)
                .with(PAYMENT_REFUNDED_KEY);
    }

    @Bean
    public JacksonJsonMessageConverter jacksonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            JacksonJsonMessageConverter converter) {

        SimpleRabbitListenerContainerFactory factory =
                new SimpleRabbitListenerContainerFactory();

        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(converter);
        factory.setDefaultRequeueRejected(false);

        return factory;
    }
}