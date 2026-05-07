package com.example.promotion.infrastructure.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionEvent {
    private String eventId;
    private String eventType; // e.g. "AdvertisementActivated", "AdvertisementDeactivated", "PromotionActivated", "PromotionPaused"
    private Integer advertisementId;
    private Integer promotionId;
    private Integer productId;
    private LocalDateTime timestamp;
}
