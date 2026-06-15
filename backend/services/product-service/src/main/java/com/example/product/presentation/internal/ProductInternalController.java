package com.example.product.presentation.internal;

import com.example.product.application.dto.ApiResponse;
import com.example.product.application.dto.ProductVariantResponse;
import com.example.product.infrastructure.persistence.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/internal/products")
@RequiredArgsConstructor
public class ProductInternalController {

    private final ProductVariantRepository variantRepository;

    @GetMapping("/{slug}")
    public ApiResponse<Object> getProductBySlugInternal(@PathVariable String slug) {
        return ApiResponse.success(null);
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
}
