package com.example.product.application.usecase;

import com.example.product.application.dto.*;
import com.example.product.infrastructure.persistence.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductQueryUseCase {
    private final SpringDataProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductAttributeRepository productAttributeRepository;

    // Admin: list products with pagination and filters
    public Page<ProductAdminSummaryResponse> listProductsAdmin(
            String keyword, Long categoryId, Long brandId, String status,
            int page, int size, String sortBy, String sortDir) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        return productRepository.findAllWithFilters(keyword, categoryId, brandId, status, pageable)
            .map(this::toAdminSummary);
    }

    // Admin: get product by slug (for admin edit page)
    public ProductAdminDetailResponse getProductBySlugAdmin(String slug) {
        return productRepository.findBySlug(slug)
            .map(this::toAdminDetail)
            .orElseThrow(() -> new com.example.product.domain.exception.DomainException("Product not found: " + slug));
    }

    // Admin: get product by ID
    public ProductAdminDetailResponse getProductByIdAdmin(Long id) {
        return productRepository.findById(id)
            .map(this::toAdminDetail)
            .orElseThrow(() -> new com.example.product.domain.exception.DomainException("Product not found: " + id));
    }

    // Variant exists check (for internal use)
    public boolean variantExists(Long variantId) {
        return variantRepository.existsById(variantId);
    }

    private ProductAdminSummaryResponse toAdminSummary(
            com.example.product.infrastructure.persistence.entity.ProductJpaEntity e) {
        ProductAdminSummaryResponse r = new ProductAdminSummaryResponse();
        r.setId(e.getId());
        r.setName(e.getName());
        r.setSlug(e.getSlug());
        r.setBasePrice(e.getBasePrice());
        r.setStatus(e.getStatus());
        r.setCreatedAt(e.getCreatedAt());
        r.setUpdatedAt(e.getUpdatedAt());
        r.setCategoryId(e.getCategoryId());
        r.setBrandId(e.getBrandId());
        // Category name
        categoryRepository.findById(e.getCategoryId()).ifPresent(c -> r.setCategoryName(c.getName()));
        brandRepository.findById(e.getBrandId()).ifPresent(b -> r.setBrandName(b.getName()));
        // Primary image
        e.getImages().stream()
            .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
            .findFirst()
            .ifPresent(img -> r.setPrimaryImageUrl(img.getImageUrl()));
        // Variant count and min price
        r.setVariantCount(e.getVariants().size());
        e.getVariants().stream()
            .map(v -> v.getPrice())
            .filter(p -> p != null)
            .min(java.math.BigDecimal::compareTo)
            .ifPresent(r::setMinVariantPrice);
        return r;
    }

    private ProductAdminDetailResponse toAdminDetail(
            com.example.product.infrastructure.persistence.entity.ProductJpaEntity e) {
        ProductAdminDetailResponse r = new ProductAdminDetailResponse();
        r.setId(e.getId());
        r.setName(e.getName());
        r.setSlug(e.getSlug());
        r.setBasePrice(e.getBasePrice());
        r.setStatus(e.getStatus());
        r.setDescription(e.getDescription());
        r.setCreatedAt(e.getCreatedAt());
        r.setUpdatedAt(e.getUpdatedAt());
        r.setCategoryId(e.getCategoryId());
        r.setBrandId(e.getBrandId());

        categoryRepository.findById(e.getCategoryId()).ifPresent(c -> {
            CategorySummaryResponse cat = new CategorySummaryResponse();
            cat.setId(c.getId()); cat.setName(c.getName()); cat.setSlug(c.getSlug());
            r.setCategory(cat);
        });
        brandRepository.findById(e.getBrandId()).ifPresent(b -> {
            BrandSummaryResponse brand = new BrandSummaryResponse();
            brand.setId(b.getId()); brand.setName(b.getName()); brand.setSlug(b.getSlug());
            brand.setLogoUrl(b.getLogoPath());
            r.setBrand(brand);
        });

        r.setImages(e.getImages().stream().map(img -> {
            ProductImageResponse dto = new ProductImageResponse();
            dto.setId(img.getId()); dto.setImageUrl(img.getImageUrl());
            dto.setIsPrimary(img.getIsPrimary());
            dto.setSortOrder(img.getSortOrder());
            return dto;
        }).toList());

        r.setVariants(e.getVariants().stream().map(v -> {
            ProductVariantResponse dto = new ProductVariantResponse();
            dto.setId(v.getId()); dto.setSku(v.getSku());
            dto.setPrice(v.getPrice()); dto.setStock(v.getStock()); dto.setStatus(v.getStatus());
            dto.setVariantSpecsJson(v.getVariantSpecsJson());
            
            if (v.getAttributeValues() != null) {
                java.util.List<VariantAttributeValueRequest> attrValues = v.getAttributeValues().stream()
                    .map(attr -> {
                        VariantAttributeValueRequest attrReq = new VariantAttributeValueRequest();
                        attrReq.setAttributeId(attr.getAttributeId());
                        attrReq.setValueId(attr.getValueId());
                        return attrReq;
                    })
                    .collect(java.util.stream.Collectors.toList());
                dto.setAttributeValues(attrValues);
            }
            
            return dto;
        }).toList());

        r.setDiscountPercent(e.getDiscountPercent());
        r.setOverview(e.getOverview());
        r.setSpecs(e.getSpecs());
        r.setAverageRating(e.getAverageRating());
        r.setTotalReviews(e.getTotalReviews());
        return r;
    }
}
