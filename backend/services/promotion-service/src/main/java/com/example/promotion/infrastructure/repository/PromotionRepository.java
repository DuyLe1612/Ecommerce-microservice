package com.example.promotion.infrastructure.repository;

import com.example.promotion.domain.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Integer> {
    List<Promotion> findByStatusOrderByPriorityDesc(Integer status);
}
