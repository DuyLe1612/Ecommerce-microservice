package com.example.promotion.presentation.controller;

import com.example.promotion.application.service.PromotionService;
import com.example.promotion.presentation.dto.PromotionResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/promotions")
@RequiredArgsConstructor
public class InternalPromotionController {

    private final PromotionService promotionService;

    @GetMapping("/active")
    public List<PromotionResponse> getActivePromotions() {
        return promotionService.getActivePromotions();
    }
}
