package com.example.product.application.dto;

import lombok.Data;
import java.util.List;

@Data
public class BlogRequest {
    private String title;
    private String slug;
    private String summary;
    private String content;
    private List<String> tags;
    private String status;
}
