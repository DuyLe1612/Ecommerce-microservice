package com.example.product.presentation.rest;

import com.example.product.application.dto.ApiResponse;
import com.example.product.application.dto.ProductAdminRequest;
import com.example.product.application.dto.ProductImageReorderRequest;
import com.example.product.application.dto.ProductVariantRequest;
import com.example.product.application.usecase.ProductCommandUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductCommandUseCase productCommandUseCase;

    @GetMapping
    public ApiResponse<Object> listProducts() {
        return ApiResponse.success((Object) productCommandUseCase.listProducts());
    }

    @PostMapping
    public ApiResponse<Object> createProduct(@RequestBody ProductAdminRequest request) {
        return ApiResponse.success(productCommandUseCase.createProduct(request));
    }

    @GetMapping("/{id}")
    public ApiResponse<Object> getProduct(@PathVariable Long id) {
        Object product = productCommandUseCase.getProduct(id);
        return product != null ? ApiResponse.success(product) : ApiResponse.error("Product not found");
    }

    @PutMapping("/{id}")
    public ApiResponse<Object> updateProduct(@PathVariable Long id, @RequestBody ProductAdminRequest request) {
        return ApiResponse.success(productCommandUseCase.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Object> deleteProduct(@PathVariable Long id) {
        productCommandUseCase.deleteProduct(id);
        return ApiResponse.success(null);
    }

    @PostMapping("/images")
    public ApiResponse<Object> uploadImage(
            @RequestParam("productId") Long productId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "isPrimary", required = false) Boolean isPrimary) {
        return ApiResponse.success(productCommandUseCase.uploadImage(productId, file, isPrimary));
    }

    @DeleteMapping("/images/{imageId}")
    public ApiResponse<Object> deleteImage(@PathVariable Long imageId) {
        productCommandUseCase.deleteImage(imageId);
        return ApiResponse.success(null);
    }

    @PostMapping("/images/reorder")
    public ApiResponse<Object> reorderImages(@RequestBody ProductImageReorderRequest request) {
        productCommandUseCase.reorderImages(request);
        return ApiResponse.success(null);
    }

    @PostMapping("/variants")
    public ApiResponse<Object> addVariant(@RequestBody ProductVariantRequest request) {
        return ApiResponse.success(productCommandUseCase.addVariant(request));
    }

    @PutMapping("/variants/{variantId}")
    public ApiResponse<Object> updateVariant(@PathVariable Long variantId, @RequestBody ProductVariantRequest request) {
        return ApiResponse.success(productCommandUseCase.updateVariant(variantId, request));
    }

    @DeleteMapping("/variants/{variantId}")
    public ApiResponse<Object> deleteVariant(@PathVariable Long variantId) {
        productCommandUseCase.deleteVariant(variantId);
        return ApiResponse.success(null);
    }

    @GetMapping("/variants/{variantId}")
    public ApiResponse<Object> getVariant(@PathVariable Long variantId) {
        Object variant = productCommandUseCase.getVariant(variantId);
        return variant != null ? ApiResponse.success(variant) : ApiResponse.error("Variant not found");
    }
}
