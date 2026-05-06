package com.example.product.presentation.rest;

import com.example.product.application.dto.ApiResponse;
import com.example.product.application.dto.CloudinaryUploadResponse;
import com.example.product.domain.external.CloudinaryGateway;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/cloudinary")
@RequiredArgsConstructor
public class CloudinaryController {

    private final CloudinaryGateway cloudinaryGateway;

    @PostMapping
    public ApiResponse<CloudinaryUploadResponse> uploadGeneric(@RequestParam("file") MultipartFile file) {
        return ApiResponse.success(cloudinaryGateway.upload(file, "misc"));
    }

    @PostMapping("/category-icon")
    public ApiResponse<CloudinaryUploadResponse> uploadCategoryIcon(@RequestParam("file") MultipartFile file) {
        return ApiResponse.success(cloudinaryGateway.upload(file, "categories"));
    }

    @PostMapping("/product-image")
    public ApiResponse<CloudinaryUploadResponse> uploadProductImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("productId") Long productId) {
        return ApiResponse.success(cloudinaryGateway.upload(file, "products/" + productId));
    }
}
