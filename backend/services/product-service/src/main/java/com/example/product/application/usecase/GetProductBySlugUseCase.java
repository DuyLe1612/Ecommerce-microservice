package com.example.product.application.usecase;

import com.example.product.application.dto.*;
import com.example.product.domain.Constants;
import com.example.product.infrastructure.persistence.entity.ProductAttributeJpaEntity;
import com.example.product.infrastructure.persistence.entity.ProductJpaEntity;
import com.example.product.infrastructure.persistence.repository.BrandRepository;
import com.example.product.infrastructure.persistence.repository.CategoryRepository;
import com.example.product.infrastructure.persistence.repository.ProductAttributeRepository;
import com.example.product.infrastructure.persistence.repository.SpringDataProductRepository;
import com.example.product.infrastructure.persistence.repository.AttributeValueRepository;
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
    private final AttributeValueRepository attributeValueRepository;

    @Cacheable(value = Constants.CACHE_PRODUCT_DETAIL, key = "#slug")
    @Transactional(readOnly = true)
    public ProductDetailResponse execute(String slug) {
        ProductJpaEntity entity = productRepository.findBySlug(slug)
            .orElseThrow(() -> new RuntimeException("Product not found with slug: " + slug));
            
        ProductDetailResponse response = new ProductDetailResponse();
        response.setId(entity.getId());
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
            dto.setIsPrimary(img.getIsPrimary());
            dto.setSortOrder(img.getSortOrder());
            return dto;
        }).toList();
        response.setImages(images);

        if (!images.isEmpty()) {
            response.setPrimaryImageUrl(images.stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .findFirst()
                .map(ProductImageResponse::getImageUrl)
                .orElse(images.get(0).getImageUrl()));
        }

        List<ProductVariantResponse> variants = entity.getVariants().stream().map(variant -> {
            ProductVariantResponse dto = new ProductVariantResponse();
            dto.setId(variant.getId());
            dto.setSku(variant.getSku());
            dto.setPrice(variant.getPrice());
            dto.setStock(variant.getStock());
            dto.setStatus(variant.getStatus());
            dto.setVariantSpecsJson(variant.getVariantSpecsJson());
            
            if (variant.getAttributeValues() != null) {
                List<VariantAttributeResponse> attributes = variant.getAttributeValues().stream()
                    .map(attr -> {
                        VariantAttributeResponse attrResp = new VariantAttributeResponse();
                        attrResp.setId(attr.getAttributeId());
                        
                        productAttributeRepository.findById(attr.getAttributeId()).ifPresent(pa -> {
                            attrResp.setName(pa.getName());
                        });
                        
                        attributeValueRepository.findById(attr.getValueId()).ifPresent(av -> {
                            attrResp.setValue(av.getValue());
                        });
                        
                        return attrResp;
                    })
                    .collect(Collectors.toList());
                dto.setAttributes(attributes);
            }
            
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
            dto.setLogoUrl(brand.getLogoPath());
            response.setBrand(dto);
        });

        response.setDiscountPercent(entity.getDiscountPercent());
        response.setOverview(entity.getOverview());
        response.setSpecs(entity.getSpecs());
        response.setAverageRating(entity.getAverageRating());
        response.setTotalReviews(entity.getTotalReviews());
        response.setTotalSold(entity.getTotalSold());

        return response;
    }
}