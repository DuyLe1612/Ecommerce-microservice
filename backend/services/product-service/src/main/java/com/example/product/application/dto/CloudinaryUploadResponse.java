package com.example.product.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CloudinaryUploadResponse {
    private String url;
    private String publicId;
    private String originalFilename;
}
