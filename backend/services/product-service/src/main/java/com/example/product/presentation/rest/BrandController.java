package com.example.product.presentation.rest;

import com.example.product.application.dto.ApiResponse;
import com.example.product.infrastructure.persistence.repository.BrandRepository;
import com.example.product.infrastructure.persistence.repository.CategoryRepository;
import com.example.product.infrastructure.persistence.repository.SpringDataProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final SpringDataProductRepository productRepository;
    
    @GetMapping
    public ApiResponse<Object> getBrands() { return ApiResponse.success(brandRepository.findAll()); }

    @GetMapping("/list")
    public ApiResponse<Object> getBrandsList() { return ApiResponse.success(brandRepository.findAll()); }

    @GetMapping("/{slug}")
    public ApiResponse<Object> getBrandBySlug(@PathVariable String slug) {
        return brandRepository.findBySlug(slug)
            .map(brand -> ApiResponse.success((Object)brand))
            .orElse(ApiResponse.error("Brand not found"));
    }

    @GetMapping("/by-category/{categorySlug}")
    public ApiResponse<Object> getBrandsByCategory(@PathVariable String categorySlug) {
        return categoryRepository.findBySlug(categorySlug)
            .map(category -> {
                List<Long> brandIds = productRepository.findDistinctBrandIdsByCategoryId(category.getId());
                return ApiResponse.success((Object)brandRepository.findAllById(brandIds));
            })
            .orElse(ApiResponse.error("Category not found"));
    }
}
