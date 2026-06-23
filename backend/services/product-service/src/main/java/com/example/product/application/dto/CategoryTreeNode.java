package com.example.product.application.dto;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class CategoryTreeNode {
    private Long id;
    private String name;
    private String slug;
    private String iconPath;
    private String imageUrl;
    private List<CategoryTreeNode> children = new ArrayList<>();
}
