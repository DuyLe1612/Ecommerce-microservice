package com.example.coupon.presentation.controller;

import com.example.coupon.application.service.CouponAdminService;
import com.example.coupon.domain.entity.Coupon;
import com.example.coupon.presentation.dto.ApiResponse;
import com.example.coupon.presentation.dto.CouponResponse;
import com.example.coupon.presentation.dto.CouponStatisticsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/coupons")
@RequiredArgsConstructor
public class AdminCouponController {

    private final CouponAdminService couponAdminService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getAllCoupons() {
        return ResponseEntity.ok(ApiResponse.success(couponAdminService.getAllCoupons()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CouponResponse>> getCouponById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(couponAdminService.getCouponById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CouponResponse>> createCoupon(@RequestBody Coupon coupon) {
        return ResponseEntity.ok(ApiResponse.success(couponAdminService.createCoupon(coupon)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CouponResponse>> updateCoupon(
            @PathVariable Integer id,
            @RequestBody Coupon couponDetails) {
        return ResponseEntity.ok(ApiResponse.success(couponAdminService.updateCoupon(id, couponDetails)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable Integer id) {
        couponAdminService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Deleted successfully"));
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<CouponResponse>> activateCoupon(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(couponAdminService.activateCoupon(id)));
    }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<CouponResponse>> deactivateCoupon(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(couponAdminService.deactivateCoupon(id)));
    }

    @GetMapping("/{id}/statistics")
    public ResponseEntity<ApiResponse<CouponStatisticsResponse>> getCouponStatistics(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(couponAdminService.getCouponStatistics(id)));
    }

    @GetMapping("/{id}/usage")
    public ResponseEntity<ApiResponse<CouponStatisticsResponse>> getCouponUsage(@PathVariable Integer id) {
        // As per typical design, usage might return paginated list of usages, but here we reuse statistics
        // or we could just alias to statistics
        return ResponseEntity.ok(ApiResponse.success(couponAdminService.getCouponStatistics(id)));
    }
}
