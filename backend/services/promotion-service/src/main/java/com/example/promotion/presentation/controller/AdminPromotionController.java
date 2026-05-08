package com.example.promotion.presentation.controller;

import com.example.promotion.application.service.PromotionService;
import com.example.promotion.presentation.dto.ApiResponse;
import com.example.promotion.presentation.dto.PromotionRequest;
import com.example.promotion.presentation.dto.PromotionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/promotions")
@RequiredArgsConstructor
public class AdminPromotionController {

    private final PromotionService promotionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PromotionResponse>>> getAllPromotions() {
        return ResponseEntity.ok(ApiResponse.success(promotionService.getAllPromotions()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<PromotionResponse>>> getActivePromotions() {
        return ResponseEntity.ok(ApiResponse.success(promotionService.getActivePromotions()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionResponse>> getPromotionById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(promotionService.getPromotionById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PromotionResponse>> createPromotion(@RequestBody PromotionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(promotionService.createPromotion(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionResponse>> updatePromotion(
            @PathVariable Integer id,
            @RequestBody PromotionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(promotionService.updatePromotion(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePromotion(@PathVariable Integer id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Deleted successfully"));
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<PromotionResponse>> activatePromotion(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(promotionService.activatePromotion(id)));
    }

    @PostMapping("/{id}/pause")
    public ResponseEntity<ApiResponse<PromotionResponse>> pausePromotion(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(promotionService.pausePromotion(id)));
    }
}
