package com.example.product.application.dto;

import lombok.Data;
import java.util.List;

@Data
public class CategoryAdminRequest {
    private String name;
    private String slug;
    private Long parentId;
    private String iconPath;
    private String imageUrl;
    private List<CategoryAttributeRequest> attributes;
}
