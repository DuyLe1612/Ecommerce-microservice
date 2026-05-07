package com.example.promotion.application.service;

import com.example.promotion.domain.entity.Promotion;
import com.example.promotion.infrastructure.event.EventPublisher;
import com.example.promotion.infrastructure.repository.PromotionRepository;
import com.example.promotion.presentation.dto.PromotionResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PromotionServiceTest {

    @Mock
    private PromotionRepository promotionRepository;

    @Mock
    private EventPublisher eventPublisher;

    @Mock
    private WebClient productWebClient;

    @InjectMocks
    private PromotionService promotionService;

    @Test
    void activatePromotion_Success() {
        Promotion promotion = Promotion.builder()
                .id(1)
                .name("Test Promo")
                .status(0)
                .value(new BigDecimal("10.00"))
                .startDate(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusDays(1))
                .build();

        when(promotionRepository.findById(1)).thenReturn(Optional.of(promotion));
        when(promotionRepository.save(any(Promotion.class))).thenReturn(promotion);

        PromotionResponse response = promotionService.activatePromotion(1);

        assertEquals(1, response.getStatus());
        verify(promotionRepository, times(1)).save(promotion);
        verify(eventPublisher, times(1)).publishPromotionEvent("PromotionActivated", 1);
    }
}
