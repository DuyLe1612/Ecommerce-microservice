package com.example.product.presentation.rest;

import com.example.product.application.dto.*;
import com.example.product.application.usecase.ProductCommandUseCase;
import com.example.product.application.usecase.ProductQueryUseCase;
import com.example.product.application.usecase.StockManagementUseCase;
import lombok.RequiredArgsConstructor;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductCommandUseCase productCommandUseCase;
    private final ProductQueryUseCase productQueryUseCase;
    private final StockManagementUseCase stockManagementUseCase;

    // QUERY: list with pagination + filters
    @GetMapping
    public ApiResponse<Page<ProductAdminSummaryResponse>> listProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        return ApiResponse.success(
            productQueryUseCase.listProductsAdmin(keyword, categoryId, brandId, status, page, size, sortBy, sortDir)
        );
    }

    // QUERY: get by slug (admin edit)
    @GetMapping("/slug/{slug}")
    public ApiResponse<ProductAdminDetailResponse> getProductBySlug(@PathVariable String slug) {
        return ApiResponse.success(productQueryUseCase.getProductBySlugAdmin(slug));
    }

    // QUERY: get by ID
    @GetMapping("/{id}")
    public ApiResponse<ProductAdminDetailResponse> getProduct(@PathVariable Long id) {
        return ApiResponse.success(productQueryUseCase.getProductByIdAdmin(id));
    }

    // COMMAND: create
    @PostMapping
    public ApiResponse<Object> createProduct(@RequestBody ProductAdminRequest request) {
        return ApiResponse.success(productCommandUseCase.createProduct(request));
    }

    // COMMAND: update
    @PutMapping("/{id}")
    public ApiResponse<Object> updateProduct(@PathVariable Long id, @RequestBody ProductAdminRequest request) {
        return ApiResponse.success(productCommandUseCase.updateProduct(id, request));
    }

    // COMMAND: delete
    @DeleteMapping("/{id}")
    public ApiResponse<Object> deleteProduct(@PathVariable Long id) {
        productCommandUseCase.deleteProduct(id);
        return ApiResponse.success(null);
    }

    // COMMAND: upload image
    @PostMapping("/images")
    public ApiResponse<Object> uploadImage(
            @RequestParam("productId") Long productId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "isPrimary", required = false) Boolean isPrimary) {
        return ApiResponse.success(productCommandUseCase.uploadImage(productId, file, isPrimary));
    }

    // COMMAND: update image metadata
    @PutMapping("/images/{imageId}")
    public ApiResponse<Object> updateImage(
            @PathVariable Long imageId,
            @RequestBody ProductImageUpdateRequest request) {
        return ApiResponse.success(productCommandUseCase.updateImage(imageId, request));
    }

    // COMMAND: delete image
    @DeleteMapping("/images/{imageId}")
    public ApiResponse<Object> deleteImage(@PathVariable Long imageId) {
        productCommandUseCase.deleteImage(imageId);
        return ApiResponse.success(null);
    }

    // COMMAND: reorder images
    @PostMapping("/images/reorder")
    public ApiResponse<Object> reorderImages(@RequestBody ProductImageReorderRequest request) {
        productCommandUseCase.reorderImages(request);
        return ApiResponse.success(null);
    }

    // COMMAND: add variant
    @PostMapping("/variants")
    public ApiResponse<Object> addVariant(@RequestBody ProductVariantRequest request) {
        return ApiResponse.success(productCommandUseCase.addVariant(request));
    }

    // COMMAND: update variant
    @PutMapping("/variants/{variantId}")
    public ApiResponse<Object> updateVariant(@PathVariable Long variantId, @RequestBody ProductVariantRequest request) {
        return ApiResponse.success(productCommandUseCase.updateVariant(variantId, request));
    }

    // COMMAND: delete variant
    @DeleteMapping("/variants/{variantId}")
    public ApiResponse<Object> deleteVariant(@PathVariable Long variantId) {
        productCommandUseCase.deleteVariant(variantId);
        return ApiResponse.success(null);
    }

    @PostMapping("/variants/{variantId}/stock")
    public ApiResponse<Object> adjustStock(
            @PathVariable Long variantId,
            @RequestBody StockAdjustRequest request) {
        stockManagementUseCase.adjustStock(variantId, request.getDelta(), request.getReason());
        return ApiResponse.success(Map.of("variantId", variantId, "delta", request.getDelta()));
    }
}
