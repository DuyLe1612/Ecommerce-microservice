package com.example.search.infrastructure.messaging;

import com.example.search.application.usecase.SearchIndexSyncUseCase;
import com.example.search.domain.SearchConstants;
import com.example.search.domain.event.ProductEventV1;
import com.example.search.domain.event.PromotionEventV1;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SearchEventConsumer {

    private final SearchIndexSyncUseCase searchIndexSyncUseCase;

    @RabbitListener(queues = SearchConstants.QUEUE_PRODUCT_CREATED)
    public void handleProductCreated(ProductEventV1 event) {
        searchIndexSyncUseCase.upsertProduct(event);
    }
    
    @RabbitListener(queues = SearchConstants.QUEUE_PRODUCT_UPDATED)
    public void handleProductUpdated(ProductEventV1 event) {
        searchIndexSyncUseCase.upsertProduct(event);
    }

    @RabbitListener(queues = SearchConstants.QUEUE_PRODUCT_DELETED)
    public void handleProductDeleted(ProductEventV1 event) {
        searchIndexSyncUseCase.deleteProduct(event);
    }

    @RabbitListener(queues = SearchConstants.QUEUE_PROMOTION_ACTIVATED)
    public void handlePromotionActivated(PromotionEventV1 event) {
        searchIndexSyncUseCase.updatePromotion(event, true);
    }

    @RabbitListener(queues = SearchConstants.QUEUE_PROMOTION_PAUSED)
    public void handlePromotionPaused(PromotionEventV1 event) {
        searchIndexSyncUseCase.updatePromotion(event, false);
    }
}
