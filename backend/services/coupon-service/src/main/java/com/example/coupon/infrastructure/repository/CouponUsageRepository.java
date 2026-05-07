package com.example.coupon.infrastructure.repository;

import com.example.coupon.domain.entity.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Integer> {
    List<CouponUsage> findByCouponId(Integer couponId);
    int countByCouponIdAndUserId(Integer couponId, Integer userId);
}
