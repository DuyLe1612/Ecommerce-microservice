package com.example.product.domain.external;

import com.example.product.application.dto.CloudinaryUploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface CloudinaryGateway {
    CloudinaryUploadResponse upload(MultipartFile file, String folder);
    void destroy(String publicId);
}
