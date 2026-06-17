package com.example.product.presentation.internal;

import com.example.product.application.dto.ApiResponse;
import com.example.product.application.dto.ProductDetailResponse;
import com.example.product.application.dto.ProductVariantResponse;
import com.example.product.application.usecase.GetProductBySlugUseCase;
import com.example.product.application.usecase.StockManagementUseCase;
import com.example.product.application.dto.StockReserveRequest;
import com.example.product.domain.exception.DomainException;
import com.example.product.infrastructure.persistence.repository.ProductVariantRepository;
import com.example.product.infrastructure.persistence.repository.SpringDataProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/internal/products")
@RequiredArgsConstructor
public class ProductInternalController {

    private final ProductVariantRepository variantRepository;
    private final GetProductBySlugUseCase getProductBySlugUseCase;
    private final StockManagementUseCase stockManagementUseCase;
    private final SpringDataProductRepository springDataProductRepository;

    @GetMapping("/{slug}")
    public ApiResponse<ProductDetailResponse> getProductBySlugInternal(@PathVariable String slug) {
        return ApiResponse.success(getProductBySlugUseCase.execute(slug));
    }

    /**
     * Validates a batch of items for stock availability and pricing.
     * Called by order-service before creating an order.
     *
     * @param items list of items each with productId (variantId) and quantity
     * @return validation result per item
     */
    @PostMapping("/validate")
    public ResponseEntity<BatchValidationResponse> validateItems(
            @RequestBody BatchValidationRequest request) {
        List<ItemValidationResult> results = request.items().stream()
                .map(item -> {
                    return variantRepository.findById(item.productId())
                            .map(variant -> new ItemValidationResult(
                                    item.productId(),
                                    true,
                                    variant.getStock() >= item.quantity(),
                                    variant.getStock(),
                                    item.quantity(),
                                    variant.getPrice(),
                                    variant.getStatus(),
                                    null
                            )).orElseGet(() -> new ItemValidationResult(
                                    item.productId(),
                                    false,
                                    false,
                                    0,
                                    item.quantity(),
                                    null,
                                    null,
                                    "Product variant not found"
                            ));
                })
                .toList();

        boolean allValid = results.stream().allMatch(ItemValidationResult::valid);
        return ResponseEntity.ok(new BatchValidationResponse(allValid, results));
    }

    public record BatchValidationRequest(List<ItemRequest> items) {
        public record ItemRequest(Long productId, int quantity) {}
    }

    public record BatchValidationResponse(boolean allValid, List<ItemValidationResult> results) {}

    public record ItemValidationResult(
            Long productId,
            boolean exists,
            boolean inStock,
            int availableStock,
            int requestedQuantity,
            java.math.BigDecimal price,
            String status,
            String error
    ) {
        public boolean valid() { return exists && inStock; }
    }

    // Reserve stock for order
    @PostMapping("/stock/reserve")
    public ResponseEntity<ApiResponse<Object>> reserveStock(@RequestBody StockReserveRequest request) {
        try {
            stockManagementUseCase.reserveStock(request.getVariantId(), request.getOrderId(), request.getQuantity());
            return ResponseEntity.ok(new ApiResponse<>(true, null, "Stock reserved"));
        } catch (DomainException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Confirm reservation after payment
    @PostMapping("/stock/confirm/{orderId}")
    public ResponseEntity<ApiResponse<Object>> confirmStock(@PathVariable Long orderId) {
        stockManagementUseCase.confirmReservation(orderId);
        return ResponseEntity.ok(new ApiResponse<>(true, null, "Stock confirmed"));
    }

    // Release reservation on cancel
    @PostMapping("/stock/release/{orderId}")
    public ResponseEntity<ApiResponse<Object>> releaseStock(@PathVariable Long orderId) {
        stockManagementUseCase.releaseReservation(orderId);
        return ResponseEntity.ok(new ApiResponse<>(true, null, "Stock released"));
    }

    // Check available stock
    @GetMapping("/stock/{variantId}")
    public ResponseEntity<ApiResponse<Integer>> getAvailableStock(@PathVariable Long variantId) {
        return ResponseEntity.ok(ApiResponse.success(stockManagementUseCase.getAvailableStock(variantId)));
    }

    // Check if product exists (for coupon/promotion service)  
    @GetMapping("/{productId}/exists")
    public ResponseEntity<Boolean> productExists(@PathVariable Long productId) {
        return ResponseEntity.ok(springDataProductRepository.existsById(productId));
    }
}
