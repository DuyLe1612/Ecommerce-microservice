package com.example.search.application.usecase;

import com.example.search.domain.event.ProductEventV1;
import com.example.search.domain.event.PromotionEventV1;
import com.example.search.domain.model.SearchProductDocument;
import com.example.search.infrastructure.client.ProductServiceClient;
import com.example.search.infrastructure.client.dto.ProductDetailResponse;
import com.example.search.infrastructure.persistence.SearchProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchIndexSyncUseCase {
    private final SearchProductRepository searchRepository;
    private final ProductServiceClient productServiceClient;

    public void upsertProduct(ProductEventV1 event) {
        if (event.getProductId() == null) return;
        SearchProductDocument doc = searchRepository.findById(event.getProductId()).orElseGet(SearchProductDocument::new);
        doc.setId(event.getProductId());
        if (event.getName() != null) doc.setName(event.getName());
        if (event.getSlug() != null) doc.setSlug(event.getSlug());
        if (event.getBasePrice() != null) doc.setBasePrice(event.getBasePrice().doubleValue());
        if (event.getCreatedAt() != null) doc.setCreatedAt(event.getCreatedAt());
        if (event.getUpdatedAt() != null) doc.setUpdatedAt(event.getUpdatedAt());

        if (doc.getSlug() != null) {
            ProductDetailResponse detail = productServiceClient.getProductDetail(doc.getSlug());
            if (detail != null) {
                if (detail.getName() != null) doc.setName(detail.getName());
                if (detail.getBasePrice() != null) doc.setBasePrice(detail.getBasePrice());
                if (detail.getCategory() != null) doc.setCategorySlug(detail.getCategory().getSlug());
                if (detail.getBrand() != null) doc.setBrandSlug(detail.getBrand().getSlug());
                if (detail.getCreatedAt() != null) doc.setCreatedAt(detail.getCreatedAt());
                if (detail.getUpdatedAt() != null) doc.setUpdatedAt(detail.getUpdatedAt());
            }
        }
        searchRepository.save(doc);
        log.info("event=search_index_upsert productId={} slug={}", doc.getId(), doc.getSlug());
    }

    public void deleteProduct(ProductEventV1 event) {
        if (event.getProductId() != null) {
            searchRepository.deleteById(event.getProductId());
            return;
        }
        if (event.getSlug() != null) {
            searchRepository.findBySlug(event.getSlug()).ifPresent(doc -> searchRepository.deleteById(doc.getId()));
        }
    }

    public void updatePromotion(PromotionEventV1 event, boolean onSale) {
        if (event.getProductIds() != null) {
            for (Long id : event.getProductIds()) {
                searchRepository.findById(id).ifPresent(doc -> {
                    doc.setOnSale(onSale);
                    searchRepository.save(doc);
                });
            }
            return;
        }
        if (event.getProductId() != null) {
            searchRepository.findById(event.getProductId()).ifPresent(doc -> {
                doc.setOnSale(onSale);
                searchRepository.save(doc);
            });
            return;
        }
        if (event.getCategorySlug() != null) {
            var items = searchRepository.findByCategorySlug(event.getCategorySlug());
            for (SearchProductDocument doc : items) doc.setOnSale(onSale);
            searchRepository.saveAll(items);
        }
    }
}
