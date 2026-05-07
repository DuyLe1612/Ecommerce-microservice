package com.example.promotion.presentation.dto;

import com.example.promotion.domain.entity.Advertisement;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdvertisementResponse {
    private Integer id;
    private Integer productId;
    private String imageUrl;
    private String position;
    private Integer priority;
    private Boolean isActive;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;

    public static AdvertisementResponse fromEntity(Advertisement advertisement) {
        return AdvertisementResponse.builder()
                .id(advertisement.getId())
                .productId(advertisement.getProductId())
                .imageUrl(advertisement.getImageUrl())
                .position(advertisement.getPosition())
                .priority(advertisement.getPriority())
                .isActive(advertisement.getIsActive())
                .startDate(advertisement.getStartDate())
                .endDate(advertisement.getEndDate())
                .createdAt(advertisement.getCreatedAt())
                .build();
    }
}
