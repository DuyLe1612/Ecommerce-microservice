package com.example.product.presentation.rest;

import com.example.product.application.dto.ApiResponse;
import com.example.product.application.dto.BrandRequest;
import com.example.product.application.util.SlugUtil;
import com.example.product.infrastructure.persistence.entity.BrandJpaEntity;
import com.example.product.infrastructure.persistence.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/brands")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminBrandController {

    private final BrandRepository brandRepository;

    @PostMapping
    public ApiResponse<Object> createBrand(@RequestBody BrandRequest request) {
        BrandJpaEntity brand = BrandJpaEntity.builder()
            .name(request.getName())
            .slug(request.getSlug() != null ? request.getSlug() : SlugUtil.slugify(request.getName()))
            .logoUrl(request.getLogoUrl())
            .build();
        return ApiResponse.success(brandRepository.save(brand));
    }

    @PutMapping("/{id}")
    public ApiResponse<Object> updateBrand(@PathVariable Long id, @RequestBody BrandRequest request) {
        BrandJpaEntity brand = brandRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Brand not found"));
        if (request.getName() != null) {
            brand.setName(request.getName());
        }
        if (request.getSlug() != null) {
            brand.setSlug(request.getSlug());
        }
        if (request.getLogoUrl() != null) {
            brand.setLogoUrl(request.getLogoUrl());
        }
        return ApiResponse.success(brandRepository.save(brand));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Object> deleteBrand(@PathVariable Long id) {
        brandRepository.deleteById(id);
        return ApiResponse.success(null);
    }
}
