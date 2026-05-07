package com.example.promotion.application.service;

import com.example.promotion.domain.entity.Advertisement;
import com.example.promotion.infrastructure.event.EventPublisher;
import com.example.promotion.infrastructure.repository.AdvertisementRepository;
import com.example.promotion.presentation.dto.AdvertisementRequest;
import com.example.promotion.presentation.dto.AdvertisementResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdvertisementService {

    private final AdvertisementRepository advertisementRepository;
    private final EventPublisher eventPublisher;
    private final WebClient productWebClient;

    public List<AdvertisementResponse> getAllAdvertisements() {
        return advertisementRepository.findAll().stream()
                .map(AdvertisementResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "activeAdvertisements", key = "'all'")
    public List<AdvertisementResponse> getActiveAdvertisements() {
        return advertisementRepository.findByIsActiveTrueOrderByPriorityDesc().stream()
                .map(AdvertisementResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "activeAdvertisements", key = "#position")
    public List<AdvertisementResponse> getActiveAdvertisementsByPosition(String position) {
        return advertisementRepository.findByPositionAndIsActiveTrueOrderByPriorityDesc(position).stream()
                .map(AdvertisementResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "activeAdvertisements", allEntries = true)
    public AdvertisementResponse createAdvertisement(AdvertisementRequest request) {
        validateProductExists(request.getProductId());

        Advertisement advertisement = Advertisement.builder()
                .productId(request.getProductId())
                .imageUrl(request.getImageUrl())
                .position(request.getPosition())
                .priority(request.getPriority())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();

        Advertisement saved = advertisementRepository.save(advertisement);
        
        if (saved.getIsActive()) {
            eventPublisher.publishAdvertisementEvent("AdvertisementActivated", saved.getId(), saved.getProductId());
        }

        return AdvertisementResponse.fromEntity(saved);
    }

    @Transactional
    @CacheEvict(value = "activeAdvertisements", allEntries = true)
    public AdvertisementResponse updateAdvertisement(Integer id, AdvertisementRequest request) {
        Advertisement advertisement = advertisementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Advertisement not found"));

        if (!advertisement.getProductId().equals(request.getProductId())) {
            validateProductExists(request.getProductId());
        }

        advertisement.setProductId(request.getProductId());
        advertisement.setImageUrl(request.getImageUrl());
        advertisement.setPosition(request.getPosition());
        advertisement.setPriority(request.getPriority());
        advertisement.setIsActive(request.getIsActive());
        advertisement.setStartDate(request.getStartDate());
        advertisement.setEndDate(request.getEndDate());

        Advertisement saved = advertisementRepository.save(advertisement);
        return AdvertisementResponse.fromEntity(saved);
    }

    @Transactional
    @CacheEvict(value = "activeAdvertisements", allEntries = true)
    public void deleteAdvertisement(Integer id) {
        if (!advertisementRepository.existsById(id)) {
            throw new RuntimeException("Advertisement not found");
        }
        advertisementRepository.deleteById(id);
    }

    @Transactional
    @CacheEvict(value = "activeAdvertisements", allEntries = true)
    public AdvertisementResponse activateAdvertisement(Integer id) {
        Advertisement advertisement = advertisementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Advertisement not found"));

        if (!advertisement.getIsActive()) {
            advertisement.setIsActive(true);
            advertisementRepository.save(advertisement);
            eventPublisher.publishAdvertisementEvent("AdvertisementActivated", advertisement.getId(), advertisement.getProductId());
        }
        return AdvertisementResponse.fromEntity(advertisement);
    }

    @Transactional
    @CacheEvict(value = "activeAdvertisements", allEntries = true)
    public AdvertisementResponse deactivateAdvertisement(Integer id) {
        Advertisement advertisement = advertisementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Advertisement not found"));

        if (advertisement.getIsActive()) {
            advertisement.setIsActive(false);
            advertisementRepository.save(advertisement);
            eventPublisher.publishAdvertisementEvent("AdvertisementDeactivated", advertisement.getId(), advertisement.getProductId());
        }
        return AdvertisementResponse.fromEntity(advertisement);
    }

    private void validateProductExists(Integer productId) {
        if (productId == null) return;
        try {
            // Assume product-service exposes an internal endpoint to check product existence
            productWebClient.get()
                    .uri("/api/internal/products/" + productId + "/exists")
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .block();
        } catch (WebClientResponseException.NotFound e) {
            throw new RuntimeException("Product not found with id: " + productId);
        } catch (Exception e) {
            log.error("Failed to validate product id {}", productId, e);
            // In a real scenario, you might want to either reject or accept with warning depending on resilience strategy.
            // For now we throw an exception
            throw new RuntimeException("Failed to validate product: " + e.getMessage());
        }
    }
}
