package com.example.promotion.infrastructure.repository;

import com.example.promotion.domain.entity.Advertisement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdvertisementRepository extends JpaRepository<Advertisement, Integer> {
    List<Advertisement> findByIsActiveTrueOrderByPriorityDesc();
    List<Advertisement> findByPositionAndIsActiveTrueOrderByPriorityDesc(String position);
}
