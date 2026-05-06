package com.example.product.application.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProductImageReorderRequest {
    private Long productId;
    private List<Long> orderedImageIds;
}
