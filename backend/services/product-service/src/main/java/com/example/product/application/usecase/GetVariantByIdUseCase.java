package com.example.product.application.usecase;

import com.example.product.application.dto.ProductVariantResponse;
import com.example.product.infrastructure.persistence.entity.ProductVariantJpaEntity;
import com.example.product.infrastructure.persistence.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;

@UseCase
@RequiredArgsConstructor
public class GetVariantByIdUseCase {

    private final ProductVariantRepository variantRepository;

    public ProductVariantResponse execute(Long variantId) {
        ProductVariantJpaEntity variant = variantRepository.findById(variantId)
            .orElseThrow(() -> new RuntimeException("Variant not found: " + variantId));

        ProductVariantResponse response = new ProductVariantResponse();
        response.setId(variant.getId());
        response.setSku(variant.getSku());
        response.setPrice(variant.getPrice());
        response.setStock(variant.getStock());
        response.setStatus(variant.getStatus());
        return response;
    }
}
