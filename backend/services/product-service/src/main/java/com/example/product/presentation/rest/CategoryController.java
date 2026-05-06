package com.example.product.presentation.rest;

import com.example.product.application.dto.ApiResponse;
import com.example.product.application.dto.CategoryAttributeResponse;
import com.example.product.application.usecase.GetCategoryTreeUseCase;
import org.springframework.web.bind.annotation.*;

import com.example.product.infrastructure.persistence.repository.CategoryRepository;
import com.example.product.infrastructure.persistence.repository.CategoryAttributeRepository;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    
    private final CategoryRepository categoryRepository;
    private final CategoryAttributeRepository categoryAttributeRepository;
    private final GetCategoryTreeUseCase getCategoryTreeUseCase;

    @GetMapping
    public ApiResponse<?> getCategories() { 
        return ApiResponse.success(categoryRepository.findAll()); 
    }

    @GetMapping("/list")
    public ApiResponse<?> getCategoriesList() { 
        return ApiResponse.success(categoryRepository.findAll()); 
    }

    @GetMapping("/tree")
    public ApiResponse<?> getCategoryTree() { 
        return ApiResponse.success(getCategoryTreeUseCase.execute());
    }

    @GetMapping("/{slug}")
    public ApiResponse<?> getCategoryBySlug(@PathVariable String slug) { 
        return categoryRepository.findBySlug(slug)
                .map(ApiResponse::success)
                .orElse(ApiResponse.error("Category not found")); 
    }

    @GetMapping("/{slug}/attributes")
    public ApiResponse<?> getCategoryAttributes(@PathVariable String slug) { 
        return categoryRepository.findBySlug(slug)
            .map(category -> {
                List<CategoryAttributeResponse> attributes = categoryAttributeRepository.findByCategoryId(category.getId())
                    .stream()
                    .map(attr -> {
                        CategoryAttributeResponse dto = new CategoryAttributeResponse();
                        dto.setName(attr.getName());
                        if (attr.getValuesCsv() == null || attr.getValuesCsv().isBlank()) {
                            dto.setValues(List.of());
                        } else {
                            dto.setValues(List.of(attr.getValuesCsv().split("\\s*,\\s*")));
                        }
                        return dto;
                    })
                    .collect(Collectors.toList());
                return ApiResponse.success(attributes);
            })
            .orElse(ApiResponse.error("Category not found"));
    }
}
