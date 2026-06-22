package com.example.product.presentation.rest;

import com.example.product.application.dto.ApiResponse;
import com.example.product.application.dto.ProductDetailResponse;
import com.example.product.application.usecase.GetProductBySlugUseCase;
import com.example.product.application.usecase.GetVariantByIdUseCase;
import com.example.product.application.dto.ProductListItemResponse;
import com.example.product.application.usecase.ProductQueryUseCase;
import com.example.product.infrastructure.persistence.repository.BrandRepository;
import com.example.product.infrastructure.persistence.repository.CategoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final GetProductBySlugUseCase getProductBySlugUseCase;
    private final GetVariantByIdUseCase getVariantByIdUseCase;
    private final ProductQueryUseCase productQueryUseCase;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    @GetMapping
    public ApiResponse<Page<ProductListItemResponse>> listProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String categorySlug,
            @RequestParam(required = false) String brandSlug,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Long categoryId = null;
        if (categorySlug != null) {
            categoryId = categoryRepository.findBySlug(categorySlug)
                .map(com.example.product.infrastructure.persistence.entity.CategoryJpaEntity::getId)
                .orElse(null);
        }
        
        Long brandId = null;
        if (brandSlug != null) {
            brandId = brandRepository.findBySlug(brandSlug)
                .map(com.example.product.infrastructure.persistence.entity.BrandJpaEntity::getId)
                .orElse(null);
        }

        Page<com.example.product.application.dto.ProductAdminSummaryResponse> adminPage = productQueryUseCase.listProductsAdmin(
            keyword, categoryId, brandId, "available", page, size, sortBy, sortDir
        );

        Page<ProductListItemResponse> publicPage = adminPage.map(admin -> {
            ProductListItemResponse item = new ProductListItemResponse();
            item.setId(admin.getId());
            item.setName(admin.getName());
            item.setSlug(admin.getSlug());
            item.setBasePrice(admin.getBasePrice());
            item.setDiscountPercent(admin.getDiscountPercent());
            item.setPrimaryImageUrl(admin.getPrimaryImageUrl());
            item.setBrandName(admin.getBrandName());
            item.setCategoryName(admin.getCategoryName());
            item.setAverageRating(admin.getAverageRating());
            item.setStatus(admin.getStatus());
            return item;
        });

        return ApiResponse.success(publicPage);
    }

    @GetMapping("/{slug}")
    public ApiResponse<ProductDetailResponse> getProductBySlug(@PathVariable String slug) {
        return ApiResponse.success(getProductBySlugUseCase.execute(slug));
    }

    @GetMapping("/variants/{variantId}")
    public ApiResponse<Object> getVariantById(@PathVariable Long variantId) {
        return ApiResponse.success(getVariantByIdUseCase.execute(variantId));
    }
}
