package com.example.coupon.application.service;

import com.example.coupon.domain.entity.Coupon;
import com.example.coupon.infrastructure.repository.CouponRepository;
import com.example.coupon.presentation.dto.CouponResponse;
import com.example.coupon.presentation.dto.ValidateCouponRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CouponServiceTest {

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private WebClient webClient;

    @Mock
    private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;

    @Mock
    private WebClient.RequestHeadersSpec requestHeadersSpec;

    @Mock
    private WebClient.ResponseSpec responseSpec;

    @InjectMocks
    private CouponService couponService;

    @Test
    void validateCoupon_Success() {
        Coupon coupon = Coupon.builder()
                .code("WELCOME10")
                .status("Active")
                .startDate(LocalDateTime.now().minusDays(1))
                .endDate(LocalDateTime.now().plusDays(10))
                .usedCount(0)
                .quantity(100)
                .minPurchaseAmount(new BigDecimal("50.00"))
                .productIds(Set.of(1))
                .categoryIds(Set.of())
                .build();

        when(couponRepository.findByCode("WELCOME10")).thenReturn(Optional.of(coupon));

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(Boolean.class)).thenReturn(Mono.just(true));

        ValidateCouponRequest request = new ValidateCouponRequest();
        request.setCode("WELCOME10");
        request.setTotalOrderAmount(new BigDecimal("100.00"));
        request.setItems(List.of(new ValidateCouponRequest.Item(1, null, new BigDecimal("100.00"), 1)));

        CouponResponse response = couponService.validateCoupon(request);

        assertNotNull(response);
        assertEquals("WELCOME10", response.getCode());
    }

    @Test
    void validateCoupon_Expired() {
        Coupon coupon = Coupon.builder()
                .code("OLDCODE")
                .status("Active")
                .startDate(LocalDateTime.now().minusDays(10))
                .endDate(LocalDateTime.now().minusDays(1))
                .usedCount(0)
                .quantity(100)
                .build();

        when(couponRepository.findByCode("OLDCODE")).thenReturn(Optional.of(coupon));

        ValidateCouponRequest request = new ValidateCouponRequest();
        request.setCode("OLDCODE");

        RuntimeException exception = assertThrows(RuntimeException.class, () -> couponService.validateCoupon(request));
        assertEquals("Coupon is expired or not yet active", exception.getMessage());
    }
}
