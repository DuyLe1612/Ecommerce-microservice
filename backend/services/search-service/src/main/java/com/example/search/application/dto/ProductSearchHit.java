package com.example.search.application.dto;

import com.example.search.domain.model.ProductDocument;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductSearchHit {
    private ProductDocument document;
    private float score;
}
