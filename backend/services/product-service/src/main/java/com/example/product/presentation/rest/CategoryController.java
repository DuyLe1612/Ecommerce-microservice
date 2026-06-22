package com.example.product.presentation.rest;

import com.example.product.application.dto.ApiResponse;
import com.example.product.application.dto.CategoryAttributeResponse;
import com.example.product.application.usecase.GetCategoryTreeUseCase;
import org.springframework.web.bind.annotation.*;

import com.example.product.infrastructure.persistence.repository.ProductAttributeRepository;
import com.example.product.infrastructure.persistence.repository.AttributeValueRepository;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final com.example.product.infrastructure.persistence.repository.CategoryRepository categoryRepository;
    private final ProductAttributeRepository productAttributeRepository;
    private final AttributeValueRepository attributeValueRepository;
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
                List<CategoryAttributeResponse> attributes = productAttributeRepository.findByCategoryIdOrIsGlobalTrue(category.getId())
                    .stream()
                    .map(attr -> {
                        CategoryAttributeResponse dto = new CategoryAttributeResponse();
                        dto.setName(attr.getName());
                        List<String> values = attributeValueRepository.findByAttributeId(attr.getId())
                                .stream().map(com.example.product.infrastructure.persistence.entity.AttributeValueJpaEntity::getValue)
                                .collect(Collectors.toList());
                        dto.setValues(values);
                        return dto;
                    })
                    .collect(Collectors.toList());
                return ApiResponse.success(attributes);
            })
            .orElse(ApiResponse.error("Category not found"));
    }
}
