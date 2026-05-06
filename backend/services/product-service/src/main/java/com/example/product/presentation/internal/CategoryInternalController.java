package com.example.product.presentation.internal;

import com.example.product.application.dto.ApiResponse;
import com.example.product.infrastructure.persistence.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/categories")
@RequiredArgsConstructor
public class CategoryInternalController {

    private final CategoryRepository categoryRepository;

    @GetMapping("/{id}")
    public ApiResponse<Object> getCategoryInternal(@PathVariable Long id) {
        var result = categoryRepository.findById(id);
        if (result.isPresent()) {
            return ApiResponse.success(result.get());
        }
        return ApiResponse.error("Category not found");
    }
}
