package com.example.coupon.infrastructure.repository;

import com.example.coupon.domain.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Integer> {
    Optional<Coupon> findByCode(String code);

    @Query("SELECT c FROM Coupon c JOIN c.categoryIds cat WHERE cat = :categoryId AND c.status = 'Active'")
    List<Coupon> findActiveCouponsByCategoryId(@Param("categoryId") Integer categoryId);

    @Query("SELECT c FROM Coupon c JOIN c.productIds prod WHERE prod = :productId AND c.status = 'Active'")
    List<Coupon> findActiveCouponsByProductId(@Param("productId") Integer productId);
}
