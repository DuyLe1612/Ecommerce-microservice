package com.example.product.presentation.rest;

import com.example.product.application.dto.ApiResponse;
import com.example.product.application.dto.ProductDetailResponse;
import com.example.product.application.usecase.GetProductBySlugUseCase;
import com.example.product.application.usecase.GetVariantByIdUseCase;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final GetProductBySlugUseCase getProductBySlugUseCase;
    private final GetVariantByIdUseCase getVariantByIdUseCase;

    @GetMapping("/{slug}")
    public ApiResponse<ProductDetailResponse> getProductBySlug(@PathVariable String slug) {
        return ApiResponse.success(getProductBySlugUseCase.execute(slug));
    }

    @GetMapping("/variants/{variantId}")
    public ApiResponse<Object> getVariantById(@PathVariable Long variantId) {
        return ApiResponse.success(getVariantByIdUseCase.execute(variantId));
    }
}
