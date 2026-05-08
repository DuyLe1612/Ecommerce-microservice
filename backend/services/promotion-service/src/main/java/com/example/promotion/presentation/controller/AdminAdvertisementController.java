package com.example.promotion.presentation.controller;

import com.example.promotion.application.service.AdvertisementService;
import com.example.promotion.presentation.dto.AdvertisementRequest;
import com.example.promotion.presentation.dto.AdvertisementResponse;
import com.example.promotion.presentation.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/advertisements")
@RequiredArgsConstructor
public class AdminAdvertisementController {

    private final AdvertisementService advertisementService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdvertisementResponse>>> getAllAdminAdvertisements() {
        return ResponseEntity.ok(ApiResponse.success(advertisementService.getAllAdvertisements()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdvertisementResponse>> createAdvertisement(
            @RequestBody AdvertisementRequest request) {
        return ResponseEntity.ok(ApiResponse.success(advertisementService.createAdvertisement(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdvertisementResponse>> updateAdvertisement(
            @PathVariable Integer id,
            @RequestBody AdvertisementRequest request) {
        return ResponseEntity.ok(ApiResponse.success(advertisementService.updateAdvertisement(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAdvertisement(@PathVariable Integer id) {
        advertisementService.deleteAdvertisement(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Deleted successfully"));
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<AdvertisementResponse>> activateAdvertisement(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(advertisementService.activateAdvertisement(id)));
    }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<AdvertisementResponse>> deactivateAdvertisement(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(advertisementService.deactivateAdvertisement(id)));
    }
}
