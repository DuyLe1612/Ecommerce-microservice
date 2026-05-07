package com.example.coupon.infrastructure.event;

import com.example.coupon.application.service.CouponAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventConsumer {

    private final CouponAdminService couponAdminService;

    @RabbitListener(queues = "coupon.order.completed.queue")
    public void handleOrderCompleted(OrderEvent event) {
        log.info("Received OrderCompleted event: {}", event);
        if (event.getCouponCode() != null && !event.getCouponCode().isEmpty()) {
            try {
                couponAdminService.recordCouponUsage(event);
            } catch (Exception e) {
                log.error("Failed to process coupon usage for event: {}", event, e);
            }
        }
    }
}
