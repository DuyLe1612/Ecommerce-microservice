package com.example.promotion.infrastructure.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventPublisher {
    private final RabbitTemplate rabbitTemplate;
    private static final String EXCHANGE_NAME = "promotion.events";

    public void publishAdvertisementEvent(String eventType, Integer advertisementId, Integer productId) {
        PromotionEvent event = PromotionEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType(eventType)
                .advertisementId(advertisementId)
                .productId(productId)
                .timestamp(LocalDateTime.now())
                .build();
                
        log.info("Publishing event: {}", event);
        try {
            rabbitTemplate.convertAndSend(EXCHANGE_NAME, resolveAdvertisementRoutingKey(eventType), event);
        } catch (Exception e) {
            log.error("Failed to publish event: {}", event, e);
        }
    }

    public void publishPromotionEvent(String eventType, Integer promotionId) {
        PromotionEvent event = PromotionEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType(eventType)
                .promotionId(promotionId)
                .timestamp(LocalDateTime.now())
                .build();
                
        log.info("Publishing event: {}", event);
        try {
            rabbitTemplate.convertAndSend(EXCHANGE_NAME, resolvePromotionRoutingKey(eventType), event);
        } catch (Exception e) {
            log.error("Failed to publish event: {}", event, e);
        }
    }

    private String resolveAdvertisementRoutingKey(String eventType) {
        return switch (eventType) {
            case "AdvertisementActivated" -> "advertisement.activated";
            case "AdvertisementDeactivated" -> "advertisement.deactivated";
            default -> "advertisement." + eventType.toLowerCase();
        };
    }

    private String resolvePromotionRoutingKey(String eventType) {
        return switch (eventType) {
            case "PromotionActivated" -> "promotion.activated";
            case "PromotionPaused" -> "promotion.paused";
            default -> "promotion." + eventType.toLowerCase();
        };
    }
}
