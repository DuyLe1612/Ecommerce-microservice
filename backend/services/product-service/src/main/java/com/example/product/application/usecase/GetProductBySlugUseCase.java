package com.example.product.application.usecase;

import com.example.product.application.dto.*;
import com.example.product.domain.Constants;
import com.example.product.infrastructure.persistence.entity.ProductAttributeJpaEntity;
import com.example.product.infrastructure.persistence.entity.ProductJpaEntity;
import com.example.product.infrastructure.persistence.repository.BrandRepository;
import com.example.product.infrastructure.persistence.repository.CategoryRepository;
import com.example.product.infrastructure.persistence.repository.ProductAttributeRepository;
import com.example.product.infrastructure.persistence.repository.SpringDataProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GetProductBySlugUseCase {

    private final SpringDataProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductAttributeRepository productAttributeRepository;

    @Cacheable(value = Constants.CACHE_PRODUCT_DETAIL, key = "#slug")
    @Transactional(readOnly = true)
    public ProductDetailResponse execute(String slug) {
        ProductJpaEntity entity = productRepository.findBySlug(slug)
            .orElseThrow(() -> new RuntimeException("Product not found with slug: " + slug));
            
        ProductDetailResponse response = new ProductDetailResponse();
        response.setName(entity.getName());
        response.setSlug(entity.getSlug());
        response.setDescription(entity.getDescription());
        response.setBasePrice(entity.getBasePrice() != null ? entity.getBasePrice().doubleValue() : 0.0);
        response.setStatus(entity.getStatus());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());

        List<ProductImageResponse> images = entity.getImages().stream().map(img -> {
            ProductImageResponse dto = new ProductImageResponse();
            dto.setId(img.getId());
            dto.setImageUrl(img.getImageUrl());
            dto.setPublicId(img.getPublicId());
            dto.setIsPrimary(img.getIsPrimary());
            dto.setSortOrder(img.getSortOrder());
            return dto;
        }).toList();
        response.setImages(images);

        List<ProductVariantResponse> variants = entity.getVariants().stream().map(variant -> {
            ProductVariantResponse dto = new ProductVariantResponse();
            dto.setId(variant.getId());
            dto.setSku(variant.getSku());
            dto.setPrice(variant.getPrice());
            dto.setStock(variant.getStock());
            dto.setStatus(variant.getStatus());
            return dto;
        }).toList();
        response.setVariants(variants);

        categoryRepository.findById(entity.getCategoryId()).ifPresent(category -> {
            CategorySummaryResponse dto = new CategorySummaryResponse();
            dto.setId(category.getId());
            dto.setName(category.getName());
            dto.setSlug(category.getSlug());
            response.setCategory(dto);
        });

        brandRepository.findById(entity.getBrandId()).ifPresent(brand -> {
            BrandSummaryResponse dto = new BrandSummaryResponse();
            dto.setId(brand.getId());
            dto.setName(brand.getName());
            dto.setSlug(brand.getSlug());
            dto.setLogoUrl(brand.getLogoUrl());
            response.setBrand(dto);
        });

        List<ProductAttributeJpaEntity> attributes = productAttributeRepository.findByProductId(entity.getId());
        Map<String, String> attributeMap = attributes.stream()
            .collect(Collectors.toMap(ProductAttributeJpaEntity::getName, ProductAttributeJpaEntity::getValue, (a, b) -> b));
        response.setAttributes(attributeMap);

        return response;
    }
}