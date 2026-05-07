package com.example.coupon.presentation.controller;

import com.example.coupon.application.service.CouponService;
import com.example.coupon.presentation.dto.ApiResponse;
import com.example.coupon.presentation.dto.CouponResponse;
import com.example.coupon.presentation.dto.ValidateCouponRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class PublicCouponController {

    private final CouponService couponService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getAllCoupons() {
        return ResponseEntity.ok(ApiResponse.success(couponService.getAllCoupons()));
    }

    @GetMapping("/{code}")
    public ResponseEntity<ApiResponse<CouponResponse>> getCouponByCode(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success(couponService.getCouponByCode(code)));
    }

    @GetMapping("/check/{code}")
    public ResponseEntity<ApiResponse<Boolean>> checkCouponByCode(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success(couponService.checkCouponByCode(code)));
    }

    @GetMapping("/for-category/{categoryId}")
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getCouponsForCategory(@PathVariable Integer categoryId) {
        return ResponseEntity.ok(ApiResponse.success(couponService.getActiveCouponsByCategoryId(categoryId)));
    }

    @GetMapping("/for-product/{productId}")
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getCouponsForProduct(@PathVariable Integer productId) {
        return ResponseEntity.ok(ApiResponse.success(couponService.getActiveCouponsByProductId(productId)));
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<CouponResponse>> validateCoupon(@RequestBody ValidateCouponRequest request) {
        return ResponseEntity.ok(ApiResponse.success(couponService.validateCoupon(request)));
    }
}
