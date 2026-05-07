package com.example.promotion.application.service;

import com.example.promotion.domain.entity.Promotion;
import com.example.promotion.infrastructure.event.EventPublisher;
import com.example.promotion.infrastructure.repository.PromotionRepository;
import com.example.promotion.presentation.dto.PromotionRequest;
import com.example.promotion.presentation.dto.PromotionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final EventPublisher eventPublisher;
    private final WebClient productWebClient;

    public List<PromotionResponse> getAllPromotions() {
        return promotionRepository.findAll().stream()
                .map(PromotionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<PromotionResponse> getActivePromotions() {
        return promotionRepository.findByStatusOrderByPriorityDesc(1).stream()
                .map(PromotionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public PromotionResponse getPromotionById(Integer id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found"));
        return PromotionResponse.fromEntity(promotion);
    }

    @Transactional
    public PromotionResponse createPromotion(PromotionRequest request) {
        validateScopes(request.getProductIds(), request.getCategoryIds());

        Promotion promotion = Promotion.builder()
                .name(request.getName())
                .description(request.getDescription())
                .type(request.getType())
                .value(request.getValue())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(request.getStatus() != null ? request.getStatus() : 0) // Default 0 (Paused)
                .priority(request.getPriority() != null ? request.getPriority() : 0)
                .stackableWithCoupons(request.getStackableWithCoupons() != null ? request.getStackableWithCoupons() : true)
                .productIds(request.getProductIds())
                .categoryIds(request.getCategoryIds())
                .build();

        Promotion saved = promotionRepository.save(promotion);

        if (saved.getStatus() == 1) {
            eventPublisher.publishPromotionEvent("PromotionActivated", saved.getId());
        }

        return PromotionResponse.fromEntity(saved);
    }

    @Transactional
    public PromotionResponse updatePromotion(Integer id, PromotionRequest request) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found"));

        validateScopes(request.getProductIds(), request.getCategoryIds());

        promotion.setName(request.getName());
        promotion.setDescription(request.getDescription());
        promotion.setType(request.getType());
        promotion.setValue(request.getValue());
        promotion.setStartDate(request.getStartDate());
        promotion.setEndDate(request.getEndDate());
        promotion.setPriority(request.getPriority());
        promotion.setStackableWithCoupons(request.getStackableWithCoupons());
        
        // We do not change status in a generic update, only via specific endpoints according to typical patterns
        // but if we do, we need to publish event
        if (request.getStatus() != null && !request.getStatus().equals(promotion.getStatus())) {
            promotion.setStatus(request.getStatus());
            if (promotion.getStatus() == 1) {
                eventPublisher.publishPromotionEvent("PromotionActivated", promotion.getId());
            } else {
                eventPublisher.publishPromotionEvent("PromotionPaused", promotion.getId());
            }
        }

        promotion.setProductIds(request.getProductIds());
        promotion.setCategoryIds(request.getCategoryIds());

        Promotion saved = promotionRepository.save(promotion);
        return PromotionResponse.fromEntity(saved);
    }

    @Transactional
    public void deletePromotion(Integer id) {
        if (!promotionRepository.existsById(id)) {
            throw new RuntimeException("Promotion not found");
        }
        promotionRepository.deleteById(id);
    }

    @Transactional
    public PromotionResponse activatePromotion(Integer id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found"));

        if (promotion.getStatus() != 1) {
            promotion.setStatus(1);
            promotionRepository.save(promotion);
            eventPublisher.publishPromotionEvent("PromotionActivated", promotion.getId());
        }
        return PromotionResponse.fromEntity(promotion);
    }

    @Transactional
    public PromotionResponse pausePromotion(Integer id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found"));

        if (promotion.getStatus() != 0) {
            promotion.setStatus(0);
            promotionRepository.save(promotion);
            eventPublisher.publishPromotionEvent("PromotionPaused", promotion.getId());
        }
        return PromotionResponse.fromEntity(promotion);
    }

    private void validateScopes(Set<Integer> productIds, Set<Integer> categoryIds) {
        if (productIds != null && !productIds.isEmpty()) {
            for (Integer productId : productIds) {
                try {
                    productWebClient.get()
                            .uri("/api/internal/products/" + productId + "/exists")
                            .retrieve()
                            .bodyToMono(Boolean.class)
                            .block();
                } catch (Exception e) {
                    throw new RuntimeException("Failed to validate product id " + productId + ": " + e.getMessage());
                }
            }
        }

        if (categoryIds != null && !categoryIds.isEmpty()) {
            for (Integer categoryId : categoryIds) {
                try {
                    productWebClient.get()
                            .uri("/api/internal/categories/" + categoryId + "/exists")
                            .retrieve()
                            .bodyToMono(Boolean.class)
                            .block();
                } catch (Exception e) {
                    throw new RuntimeException("Failed to validate category id " + categoryId + ": " + e.getMessage());
                }
            }
        }
    }
}
