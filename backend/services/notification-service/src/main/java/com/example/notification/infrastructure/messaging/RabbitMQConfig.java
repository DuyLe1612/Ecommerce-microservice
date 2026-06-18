package com.example.notification.infrastructure.messaging;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.retry.interceptor.RetryInterceptorBuilder;
import org.springframework.retry.interceptor.RetryOperationsInterceptor;

@Configuration
public class RabbitMQConfig {
    public static final String DLX = "notification.events.dlx";
    public static final String USER_EVENTS = "user.events";
    public static final String PAYMENT_EVENTS = "payment.events";
    public static final String ORDER_EVENTS = "order.events";
    public static final String REVIEW_EVENTS = "review.events";

    public static final String USER_REGISTERED_QUEUE = "notification.user.registered";
    public static final String PAYMENT_SUCCESS_QUEUE = "notification.payment.succeeded";
    public static final String PAYMENT_FAILED_QUEUE = "notification.payment.failed";
    public static final String ORDER_SHIPPED_QUEUE = "notification.order.shipped";
    public static final String ORDER_DELIVERED_QUEUE = "notification.order.delivered";
    public static final String REVIEW_APPROVED_QUEUE = "notification.review.approved";

    @Bean
    public TopicExchange userEventsExchange() { return ExchangeBuilder.topicExchange(USER_EVENTS).durable(true).build(); }
    @Bean
    public TopicExchange paymentEventsExchange() { return ExchangeBuilder.topicExchange(PAYMENT_EVENTS).durable(true).build(); }
    @Bean
    public TopicExchange orderEventsExchange() { return ExchangeBuilder.topicExchange(ORDER_EVENTS).durable(true).build(); }
    @Bean
    public TopicExchange reviewEventsExchange() { return ExchangeBuilder.topicExchange(REVIEW_EVENTS).durable(true).build(); }
    @Bean
    public TopicExchange notificationDlx() { return ExchangeBuilder.topicExchange(DLX).durable(true).build(); }

    @Bean
    public Queue userRegisteredQueue() { return queue(USER_REGISTERED_QUEUE); }
    @Bean
    public Queue paymentSuccessQueue() { return queue(PAYMENT_SUCCESS_QUEUE); }
    @Bean
    public Queue paymentFailedQueue() { return queue(PAYMENT_FAILED_QUEUE); }
    @Bean
    public Queue orderShippedQueue() { return queue(ORDER_SHIPPED_QUEUE); }
    @Bean
    public Queue orderDeliveredQueue() { return queue(ORDER_DELIVERED_QUEUE); }
    @Bean
    public Queue reviewApprovedQueue() { return queue(REVIEW_APPROVED_QUEUE); }

    @Bean
    public Queue userRegisteredDlq() { return dlq(USER_REGISTERED_QUEUE); }
    @Bean
    public Queue paymentSuccessDlq() { return dlq(PAYMENT_SUCCESS_QUEUE); }
    @Bean
    public Queue paymentFailedDlq() { return dlq(PAYMENT_FAILED_QUEUE); }
    @Bean
    public Queue orderShippedDlq() { return dlq(ORDER_SHIPPED_QUEUE); }
    @Bean
    public Queue orderDeliveredDlq() { return dlq(ORDER_DELIVERED_QUEUE); }
    @Bean
    public Queue reviewApprovedDlq() { return dlq(REVIEW_APPROVED_QUEUE); }

    @Bean
    public Binding bindUserRegistered(Queue userRegisteredQueue, TopicExchange userEventsExchange) {
        return BindingBuilder.bind(userRegisteredQueue).to(userEventsExchange).with("user.registered");
    }

    @Bean
    public Binding bindPaymentSuccess(Queue paymentSuccessQueue, TopicExchange paymentEventsExchange) {
        return BindingBuilder.bind(paymentSuccessQueue).to(paymentEventsExchange).with("payment.succeeded");
    }

    @Bean
    public Binding bindPaymentFailed(Queue paymentFailedQueue, TopicExchange paymentEventsExchange) {
        return BindingBuilder.bind(paymentFailedQueue).to(paymentEventsExchange).with("payment.failed");
    }

    @Bean
    public Binding bindOrderShipped(Queue orderShippedQueue, TopicExchange orderEventsExchange) {
        return BindingBuilder.bind(orderShippedQueue).to(orderEventsExchange).with("order.shipped");
    }

    @Bean
    public Binding bindOrderDelivered(Queue orderDeliveredQueue, TopicExchange orderEventsExchange) {
        return BindingBuilder.bind(orderDeliveredQueue).to(orderEventsExchange).with("order.delivered");
    }

    @Bean
    public Binding bindReviewApproved(Queue reviewApprovedQueue, TopicExchange reviewEventsExchange) {
        return BindingBuilder.bind(reviewApprovedQueue).to(reviewEventsExchange).with("review.approved");
    }

    @Bean
    public Binding bindUserRegisteredDlq(Queue userRegisteredDlq, TopicExchange notificationDlx) {
        return BindingBuilder.bind(userRegisteredDlq).to(notificationDlx).with(dlqRoutingKey(USER_REGISTERED_QUEUE));
    }

    @Bean
    public Binding bindPaymentSuccessDlq(Queue paymentSuccessDlq, TopicExchange notificationDlx) {
        return BindingBuilder.bind(paymentSuccessDlq).to(notificationDlx).with(dlqRoutingKey(PAYMENT_SUCCESS_QUEUE));
    }

    @Bean
    public Binding bindPaymentFailedDlq(Queue paymentFailedDlq, TopicExchange notificationDlx) {
        return BindingBuilder.bind(paymentFailedDlq).to(notificationDlx).with(dlqRoutingKey(PAYMENT_FAILED_QUEUE));
    }

    @Bean
    public Binding bindOrderShippedDlq(Queue orderShippedDlq, TopicExchange notificationDlx) {
        return BindingBuilder.bind(orderShippedDlq).to(notificationDlx).with(dlqRoutingKey(ORDER_SHIPPED_QUEUE));
    }

    @Bean
    public Binding bindOrderDeliveredDlq(Queue orderDeliveredDlq, TopicExchange notificationDlx) {
        return BindingBuilder.bind(orderDeliveredDlq).to(notificationDlx).with(dlqRoutingKey(ORDER_DELIVERED_QUEUE));
    }

    @Bean
    public Binding bindReviewApprovedDlq(Queue reviewApprovedDlq, TopicExchange notificationDlx) {
        return BindingBuilder.bind(reviewApprovedDlq).to(notificationDlx).with(dlqRoutingKey(REVIEW_APPROVED_QUEUE));
    }

    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RetryOperationsInterceptor notificationRetryInterceptor() {
        return RetryInterceptorBuilder.stateless()
            .maxAttempts(3)
            .backOffOptions(1000, 2.0, 10000)
            .build();
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            MessageConverter messageConverter,
            RetryOperationsInterceptor notificationRetryInterceptor) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(messageConverter);
        factory.setAdviceChain(notificationRetryInterceptor);
        factory.setDefaultRequeueRejected(false);
        return factory;
    }

    private Queue queue(String name) {
        return QueueBuilder.durable(name)
            .withArgument("x-dead-letter-exchange", DLX)
            .withArgument("x-dead-letter-routing-key", dlqRoutingKey(name))
            .build();
    }

    private Queue dlq(String name) {
        return QueueBuilder.durable(dlqRoutingKey(name)).build();
    }

    private String dlqRoutingKey(String name) {
        return name + ".dlq";
    }
}
