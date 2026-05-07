package com.example.promotion.presentation.controller;

import com.example.promotion.application.service.AdvertisementService;
import com.example.promotion.presentation.dto.AdvertisementResponse;
import com.example.promotion.presentation.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/advertisements")
@RequiredArgsConstructor
public class PublicAdvertisementController {

    private final AdvertisementService advertisementService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdvertisementResponse>>> getAllAdvertisements() {
        return ResponseEntity.ok(ApiResponse.success(advertisementService.getAllAdvertisements()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<AdvertisementResponse>>> getActiveAdvertisements() {
        return ResponseEntity.ok(ApiResponse.success(advertisementService.getActiveAdvertisements()));
    }

    @GetMapping("/position/{position}")
    public ResponseEntity<ApiResponse<List<AdvertisementResponse>>> getActiveAdvertisementsByPosition(
            @PathVariable String position) {
        return ResponseEntity.ok(ApiResponse.success(advertisementService.getActiveAdvertisementsByPosition(position)));
    }
}
