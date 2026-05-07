package com.example.promotion.application.service;

import com.example.promotion.domain.entity.Advertisement;
import com.example.promotion.infrastructure.event.EventPublisher;
import com.example.promotion.infrastructure.repository.AdvertisementRepository;
import com.example.promotion.presentation.dto.AdvertisementResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdvertisementServiceTest {

    @Mock
    private AdvertisementRepository advertisementRepository;

    @Mock
    private EventPublisher eventPublisher;

    @Mock
    private WebClient productWebClient;

    @InjectMocks
    private AdvertisementService advertisementService;

    @Test
    void getActiveAdvertisements() {
        Advertisement ad = Advertisement.builder().id(1).productId(100).isActive(true).build();
        when(advertisementRepository.findByIsActiveTrueOrderByPriorityDesc()).thenReturn(List.of(ad));

        List<AdvertisementResponse> result = advertisementService.getActiveAdvertisements();

        assertEquals(1, result.size());
        assertEquals(1, result.get(0).getId());
        verify(advertisementRepository, times(1)).findByIsActiveTrueOrderByPriorityDesc();
    }
}
