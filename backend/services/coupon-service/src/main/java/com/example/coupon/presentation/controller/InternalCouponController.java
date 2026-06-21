package com.example.coupon.presentation.controller;

import com.example.coupon.application.service.CouponService;
import com.example.coupon.presentation.dto.CouponResponse;
import com.example.coupon.presentation.dto.ValidateCouponRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/coupons")
@RequiredArgsConstructor
public class InternalCouponController {

    private final CouponService couponService;

    @PostMapping("/validate")
    public ResponseEntity<CouponResponse> validateCouponInternal(@RequestBody ValidateCouponRequest request) {
        // Internal endpoint returns DTO directly without ApiResponse envelope (optional, but typical for internal calls)
        return ResponseEntity.ok(couponService.validateCoupon(request));
    }
}
