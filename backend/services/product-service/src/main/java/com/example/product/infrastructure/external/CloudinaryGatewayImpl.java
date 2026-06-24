package com.example.product.infrastructure.external;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.product.application.dto.CloudinaryUploadResponse;
import com.example.product.domain.external.CloudinaryGateway;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryGatewayImpl implements CloudinaryGateway {
    
    private final Cloudinary cloudinary;
    private final String apiKey;

    public CloudinaryGatewayImpl(
            @Value("${cloudinary.cloud_name}") String cloudName,
            @Value("${cloudinary.api_key}") String apiKey,
            @Value("${cloudinary.api_secret}") String apiSecret) {
        this.apiKey = apiKey;
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret));
    }

    @Override
    public CloudinaryUploadResponse upload(MultipartFile file, String folder) {
        if ("dummy".equals(apiKey)) {
            return new CloudinaryUploadResponse(
                "https://via.placeholder.com/400x400?text=" + file.getOriginalFilename(),
                "mock/" + System.currentTimeMillis(),
                file.getOriginalFilename()
            );
        }

        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", folder
            ));
            String url = uploadResult.get("secure_url") != null ? uploadResult.get("secure_url").toString() : null;
            String publicId = uploadResult.get("public_id") != null ? uploadResult.get("public_id").toString() : null;
            return new CloudinaryUploadResponse(url, publicId, file.getOriginalFilename());
        } catch (IOException e) {
            throw new RuntimeException("Image upload failed", e);
        }
    }

    @Override
    public void destroy(String publicId) {
        if ("dummy".equals(apiKey)) {
            return;
        }
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (Exception e) {
            throw new RuntimeException("Image deletion failed", e);
        }
    }
}