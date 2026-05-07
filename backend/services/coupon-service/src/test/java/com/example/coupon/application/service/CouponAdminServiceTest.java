package com.example.coupon.application.service;

import com.example.coupon.domain.entity.Coupon;
import com.example.coupon.domain.entity.CouponUsage;
import com.example.coupon.infrastructure.event.OrderEvent;
import com.example.coupon.infrastructure.repository.CouponRepository;
import com.example.coupon.infrastructure.repository.CouponUsageRepository;
import com.example.coupon.presentation.dto.CouponStatisticsResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CouponAdminServiceTest {

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private CouponUsageRepository couponUsageRepository;

    @InjectMocks
    private CouponAdminService couponAdminService;

    @Test
    void recordCouponUsage_Success() {
        Coupon coupon = Coupon.builder()
                .id(1)
                .code("TEST10")
                .usedCount(0)
                .build();

        OrderEvent event = OrderEvent.builder()
                .couponCode("TEST10")
                .orderId(101)
                .userId(1)
                .discountAmount(new BigDecimal("10.00"))
                .totalOrderAmount(new BigDecimal("100.00"))
                .build();

        when(couponRepository.findByCode("TEST10")).thenReturn(Optional.of(coupon));

        couponAdminService.recordCouponUsage(event);

        assertEquals(1, coupon.getUsedCount());
        verify(couponUsageRepository, times(1)).save(any(CouponUsage.class));
        verify(couponRepository, times(1)).save(coupon);
    }

    @Test
    void getCouponStatistics_Success() {
        when(couponRepository.existsById(1)).thenReturn(true);
        
        CouponUsage usage1 = CouponUsage.builder()
                .discountAmount(new BigDecimal("10.00"))
                .totalOrderAmount(new BigDecimal("100.00"))
                .build();
        CouponUsage usage2 = CouponUsage.builder()
                .discountAmount(new BigDecimal("20.00"))
                .totalOrderAmount(new BigDecimal("200.00"))
                .build();
                
        when(couponUsageRepository.findByCouponId(1)).thenReturn(List.of(usage1, usage2));

        CouponStatisticsResponse stats = couponAdminService.getCouponStatistics(1);

        assertEquals(2, stats.getTotalUsage());
        assertEquals(new BigDecimal("30.00"), stats.getTotalDiscountAmount());
        assertEquals(new BigDecimal("300.00"), stats.getRevenueAttributed());
    }
}
