package com.example.product.application.dto;

import lombok.Data;
import java.util.List;

@Data
public class CategoryAttributeResponse {
    private String name;
    private List<String> values;
}
