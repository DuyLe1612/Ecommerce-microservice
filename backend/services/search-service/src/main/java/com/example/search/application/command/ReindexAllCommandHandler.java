package com.example.search.application.command;

import com.example.search.domain.model.ProductDocument;
import com.example.search.domain.repository.ProductSearchRepository;
import com.example.search.infrastructure.external.ProductServiceClient;
import com.example.search.infrastructure.external.dto.IndexFeedResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReindexAllCommandHandler {
    private final ProductSearchRepository repository;
    private final ProductServiceClient productServiceClient;

    public int execute(ReindexAllCommand command) {
        log.info("Starting full reindex...");
        int page = 0;
        int size = 100;
        int indexedCount = 0;
        Set<String> existingIds = repository.findAllIds();
        
        while (true) {
            IndexFeedResponse response = productServiceClient.getIndexFeed(page, size, null);
            if (response == null || response.getContent() == null || response.getContent().isEmpty()) {
                break;
            }
            
            List<ProductDocument> docs = response.getContent().stream().map(dto -> {
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
                return doc;
            }).collect(Collectors.toList());
            
            repository.saveAll(docs);
            indexedCount += docs.size();
            
            for (ProductDocument doc : docs) {
                existingIds.remove(doc.getId());
            }
            
            if (page >= response.getTotalPages() - 1) {
                break;
            }
            page++;
        }
        
        if (!existingIds.isEmpty()) {
            log.info("Deleting {} orphaned records", existingIds.size());
            repository.deleteAllById(existingIds.stream().toList());
        }
        
        log.info("Reindex completed. Indexed: {}, Deleted: {}", indexedCount, existingIds.size());
        return indexedCount;
    }
}
