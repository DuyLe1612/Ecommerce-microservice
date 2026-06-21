package com.example.notification.infrastructure.messaging;

import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.annotation.PostConstruct;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.atomic.AtomicInteger;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationQueueMetrics {
    private final RabbitAdmin rabbitAdmin;
    private final MeterRegistry meterRegistry;
    private final Map<String, AtomicInteger> queueLagGauges = new LinkedHashMap<>();

    @PostConstruct
    public void registerGauges() {
        for (String queueName : queueNames()) {
            AtomicInteger gaugeValue = new AtomicInteger(0);
            queueLagGauges.put(queueName, gaugeValue);
            Gauge.builder("notification_queue_lag", gaugeValue, AtomicInteger::get)
                .description("Ready messages waiting in a notification consumer queue")
                .tag("queue", queueName)
                .register(meterRegistry);
        }
        refreshQueueLag();
    }

    @Scheduled(fixedDelayString = "${notification.metrics.queue-lag-refresh-ms:30000}")
    public void refreshQueueLag() {
        queueLagGauges.forEach((queueName, gaugeValue) -> {
            try {
                Properties properties = rabbitAdmin.getQueueProperties(queueName);
                Object count = properties == null ? null : properties.get(RabbitAdmin.QUEUE_MESSAGE_COUNT);
                gaugeValue.set(count instanceof Number number ? number.intValue() : 0);
            } catch (Exception ex) {
                log.warn("Unable to refresh notification queue lag for {}", queueName, ex);
                gaugeValue.set(-1);
            }
        });
    }

    private String[] queueNames() {
        return new String[] {
            RabbitMQConfig.USER_REGISTERED_QUEUE,
            RabbitMQConfig.PAYMENT_SUCCESS_QUEUE,
            RabbitMQConfig.PAYMENT_FAILED_QUEUE,
            RabbitMQConfig.ORDER_SHIPPED_QUEUE,
            RabbitMQConfig.ORDER_DELIVERED_QUEUE,
            RabbitMQConfig.ORDER_CANCELLED_QUEUE,
            RabbitMQConfig.REVIEW_APPROVED_QUEUE
        };
    }
}
