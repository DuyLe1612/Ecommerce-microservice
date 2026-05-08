package com.example.coupon.application.service;

import com.example.coupon.domain.entity.Coupon;
import com.example.coupon.domain.entity.CouponUsage;
import com.example.coupon.infrastructure.event.OrderEvent;
import com.example.coupon.infrastructure.repository.CouponRepository;
import com.example.coupon.infrastructure.repository.CouponUsageRepository;
import com.example.coupon.presentation.dto.CouponResponse;
import com.example.coupon.presentation.dto.CouponStatisticsResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CouponAdminService {

    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;

    public List<CouponResponse> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(CouponResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public CouponResponse getCouponById(Integer id) {
        return couponRepository.findById(id)
                .map(CouponResponse::fromEntity)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));
    }

    @Transactional
    public CouponResponse createCoupon(Coupon coupon) {
        if (couponRepository.findByCode(coupon.getCode()).isPresent()) {
            throw new RuntimeException("Coupon code already exists");
        }
        return CouponResponse.fromEntity(couponRepository.save(coupon));
    }

    @Transactional
    public CouponResponse updateCoupon(Integer id, Coupon couponDetails) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));

        Optional<Coupon> existing = couponRepository.findByCode(couponDetails.getCode());
        if (existing.isPresent() && !existing.get().getId().equals(id)) {
            throw new RuntimeException("Coupon code already exists");
        }

        coupon.setCode(couponDetails.getCode());
        coupon.setName(couponDetails.getName());
        coupon.setType(couponDetails.getType());
        coupon.setValue(couponDetails.getValue());
        coupon.setQuantity(couponDetails.getQuantity());
        coupon.setMaxUsagePerUser(couponDetails.getMaxUsagePerUser());
        coupon.setMinPurchaseAmount(couponDetails.getMinPurchaseAmount());
        coupon.setMaxDiscountAmount(couponDetails.getMaxDiscountAmount());
        coupon.setStartDate(couponDetails.getStartDate());
        coupon.setEndDate(couponDetails.getEndDate());
        coupon.setNote(couponDetails.getNote());
        coupon.setProductIds(couponDetails.getProductIds());
        coupon.setCategoryIds(couponDetails.getCategoryIds());

        return CouponResponse.fromEntity(couponRepository.save(coupon));
    }

    @Transactional
    public void deleteCoupon(Integer id) {
        if (!couponRepository.existsById(id)) {
            throw new RuntimeException("Coupon not found");
        }
        couponRepository.deleteById(id);
    }

    @Transactional
    public CouponResponse activateCoupon(Integer id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));
        if (!"Active".equals(coupon.getStatus())) {
            coupon.setStatus("Active");
            couponRepository.save(coupon);
        }
        return CouponResponse.fromEntity(coupon);
    }

    @Transactional
    public CouponResponse deactivateCoupon(Integer id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));
        if ("Active".equals(coupon.getStatus())) {
            coupon.setStatus("Inactive");
            couponRepository.save(coupon);
        }
        return CouponResponse.fromEntity(coupon);
    }

    public CouponStatisticsResponse getCouponStatistics(Integer id) {
        if (!couponRepository.existsById(id)) {
            throw new RuntimeException("Coupon not found");
        }

        List<CouponUsage> usages = couponUsageRepository.findByCouponId(id);
        
        int totalUsage = usages.size();
        BigDecimal totalDiscount = usages.stream()
                .map(CouponUsage::getDiscountAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal revenueAttributed = usages.stream()
                .map(CouponUsage::getTotalOrderAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CouponStatisticsResponse.builder()
                .couponId(id)
                .totalUsage(totalUsage)
                .totalDiscountAmount(totalDiscount)
                .revenueAttributed(revenueAttributed)
                .build();
    }

    @Transactional
    public void recordCouponUsage(OrderEvent event) {
        Coupon coupon = couponRepository.findByCode(event.getCouponCode())
                .orElseThrow(() -> new RuntimeException("Coupon not found: " + event.getCouponCode()));

        CouponUsage usage = CouponUsage.builder()
                .couponId(coupon.getId())
                .orderId(event.getOrderId())
                .userId(event.getUserId())
                .discountAmount(event.getDiscountAmount())
                .totalOrderAmount(event.getTotalOrderAmount())
                .build();

        couponUsageRepository.save(usage);

        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);
        log.info("Recorded usage for coupon {}. New used count: {}", coupon.getCode(), coupon.getUsedCount());
    }
}
