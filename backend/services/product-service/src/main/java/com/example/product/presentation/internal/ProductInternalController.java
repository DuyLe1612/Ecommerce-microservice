package com.example.product.presentation.internal;

import com.example.product.application.dto.ApiResponse;
import com.example.product.application.dto.ProductDetailResponse;
import com.example.product.application.usecase.GetProductBySlugUseCase;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/internal/products")
@RequiredArgsConstructor
public class ProductInternalController {

    private final GetProductBySlugUseCase getProductBySlugUseCase;

    @GetMapping("/{slug}")
    public ApiResponse<ProductDetailResponse> getProductBySlugInternal(@PathVariable String slug) {
        return ApiResponse.success(getProductBySlugUseCase.execute(slug));
    }
}
