package com.example.search.infrastructure.messaging;

import com.example.search.application.command.DeleteProductIndexCommand;
import com.example.search.application.command.DeleteProductIndexCommandHandler;
import com.example.search.application.command.IndexProductCommand;
import com.example.search.application.command.IndexProductCommandHandler;
import com.example.search.domain.model.ProductDocument;
import com.example.search.domain.repository.ProductSearchRepository;
import com.example.search.infrastructure.external.ProductServiceClient;
import com.example.search.infrastructure.external.dto.IndexFeedResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductEventConsumer {

    private final ProductServiceClient productServiceClient;
    private final IndexProductCommandHandler indexProductCommandHandler;
    private final DeleteProductIndexCommandHandler deleteProductIndexCommandHandler;
    private final ProductSearchRepository repository;

    @RabbitListener(queues = RabbitMQConfig.PRODUCT_QUEUE)
    public void handleProductEvent(Map<String, Object> event, Message message) {
        String routingKey = message.getMessageProperties().getReceivedRoutingKey();
        log.info("Received event {} with payload {}", routingKey, event);
        
        try {
            if ("product.deleted".equals(routingKey)) {
                String productId = (String) event.get("id");
                if (productId != null) {
                    deleteProductIndexCommandHandler.execute(new DeleteProductIndexCommand(productId));
                }
            } else if ("product.created".equals(routingKey) || "product.updated".equals(routingKey)) {
                String slug = (String) event.get("slug");
                if (slug != null) {
                    IndexFeedResponse.ProductFeedDto dto = productServiceClient.getProductBySlug(slug);
                    if (dto != null) {
                        ProductDocument doc = new ProductDocument();
                        doc.setId(dto.getId());
                        doc.setSlug(dto.getSlug());
                        doc.setName(dto.getName());
                        doc.setCategoryId(dto.getCategoryId());
                        doc.setCategoryName(dto.getCategoryName());
                        doc.setBrandId(dto.getBrandId());
                        doc.setBrandName(dto.getBrandName());
                        doc.setBasePrice(dto.getBasePrice());
                        doc.setMinVariantPrice(dto.getMinVariantPrice());
                        doc.setDiscountPercent(dto.getDiscountPercent());
                        doc.setStatus(dto.getStatus());
                        doc.setSpecs(dto.getSpecs());
                        doc.setAverageRating(dto.getAverageRating());
                        doc.setTotalReviews(dto.getTotalReviews());
                        doc.setCreatedAt(dto.getCreatedAt() != null ? dto.getCreatedAt().toInstant(java.time.ZoneOffset.UTC) : null);
                        doc.setUpdatedAt(dto.getUpdatedAt() != null ? dto.getUpdatedAt().toInstant(java.time.ZoneOffset.UTC) : null);
                        doc.setPrimaryImageUrl(dto.getPrimaryImageUrl());
                        
                        indexProductCommandHandler.execute(new IndexProductCommand(doc));
                    } else {
                        log.warn("Product details not found for slug: {}", slug);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to process event " + routingKey, e);
        }
    }

    @RabbitListener(queues = RabbitMQConfig.CATALOG_QUEUE)
    public void handleCatalogEvent(Map<String, Object> event, Message message) {
        String routingKey = message.getMessageProperties().getReceivedRoutingKey();
        log.info("Received event {} with payload {}", routingKey, event);
        
        try {
            if ("category.updated".equals(routingKey)) {
                String categoryId = (String) event.get("id");
                String categoryName = (String) event.get("name");
                if (categoryId != null && categoryName != null) {
                    repository.updateCategoryName(categoryId, categoryName);
                }
            }
        } catch (Exception e) {
            log.error("Failed to process catalog event", e);
        }
    }
}
