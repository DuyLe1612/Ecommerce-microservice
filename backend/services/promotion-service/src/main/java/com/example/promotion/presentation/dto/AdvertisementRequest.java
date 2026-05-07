package com.example.promotion.presentation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdvertisementRequest {
    private Integer productId;
    private String imageUrl;
    private String position;
    private Integer priority;
    private Boolean isActive;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
