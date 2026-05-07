package com.example.coupon.application.service;

import com.example.coupon.domain.entity.Coupon;
import com.example.coupon.infrastructure.repository.CouponRepository;
import com.example.coupon.presentation.dto.CouponResponse;
import com.example.coupon.presentation.dto.ValidateCouponRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final WebClient productWebClient;

    public List<CouponResponse> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(CouponResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public CouponResponse getCouponByCode(String code) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));
        return CouponResponse.fromEntity(coupon);
    }

    public boolean checkCouponByCode(String code) {
        return couponRepository.findByCode(code)
                .filter(c -> "Active".equals(c.getStatus())
                        && c.getStartDate().isBefore(LocalDateTime.now())
                        && c.getEndDate().isAfter(LocalDateTime.now())
                        && c.getUsedCount() < c.getQuantity())
                .isPresent();
    }

    public List<CouponResponse> getActiveCouponsByCategoryId(Integer categoryId) {
        return couponRepository.findActiveCouponsByCategoryId(categoryId).stream()
                .map(CouponResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<CouponResponse> getActiveCouponsByProductId(Integer productId) {
        return couponRepository.findActiveCouponsByProductId(productId).stream()
                .map(CouponResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public CouponResponse validateCoupon(ValidateCouponRequest request) {
        Coupon coupon = couponRepository.findByCode(request.getCode())
                .orElseThrow(() -> new RuntimeException("Coupon not found"));

        // 1. Check Status
        if (!"Active".equals(coupon.getStatus())) {
            throw new RuntimeException("Coupon is not active");
        }

        // 2. Check Expiry
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(coupon.getStartDate()) || now.isAfter(coupon.getEndDate())) {
            throw new RuntimeException("Coupon is expired or not yet active");
        }

        // 3. Check Usage Limit (Total quantity)
        if (coupon.getUsedCount() >= coupon.getQuantity()) {
            throw new RuntimeException("Coupon usage limit exceeded");
        }

        // 4. Min Purchase Amount Check
        if (coupon.getMinPurchaseAmount() != null && request.getTotalOrderAmount() != null) {
            if (request.getTotalOrderAmount().compareTo(coupon.getMinPurchaseAmount()) < 0) {
                throw new RuntimeException("Order amount does not meet minimum requirement");
            }
        }

        // 5. Scope validation with product-service and requested items
        boolean isValidScope = false;
        if (coupon.getProductIds().isEmpty() && coupon.getCategoryIds().isEmpty()) {
            isValidScope = true; // Global coupon
        } else if (request.getItems() != null) {
            for (ValidateCouponRequest.Item item : request.getItems()) {
                // Verify product exists with product-service
                verifyProductWithService(item.getProductId());

                if (coupon.getProductIds().contains(item.getProductId()) ||
                    coupon.getCategoryIds().contains(item.getCategoryId())) {
                    isValidScope = true;
                    break;
                }
            }
        }

        if (!isValidScope) {
            throw new RuntimeException("Coupon does not apply to any items in the order");
        }

        return CouponResponse.fromEntity(coupon);
    }

    private void verifyProductWithService(Integer productId) {
        if (productId == null) return;
        try {
            Boolean exists = productWebClient.get()
                    .uri("/api/internal/products/" + productId + "/exists")
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .block();
            if (Boolean.FALSE.equals(exists)) {
                throw new RuntimeException("Product not found");
            }
        } catch (Exception e) {
            log.error("Failed to verify product {}: {}", productId, e.getMessage());
            throw new RuntimeException("Product validation failed: " + e.getMessage());
        }
    }
}
