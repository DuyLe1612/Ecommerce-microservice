package com.example.search.domain.event;

import lombok.Data;

import java.util.List;

@Data
public class PromotionEventV1 {
    private String eventVersion;
    private String eventType;
    private Long productId;
    private List<Long> productIds;
    private String categorySlug;
}
