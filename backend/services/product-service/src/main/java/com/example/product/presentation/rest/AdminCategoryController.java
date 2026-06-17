package com.example.product.presentation.rest;

import com.example.product.application.dto.ApiResponse;
import com.example.product.application.dto.CategoryAdminRequest;
import com.example.product.application.dto.CategoryAttributeRequest;
import com.example.product.application.dto.CategoryAttributeWithCategoryRequest;
import com.example.product.application.dto.AttributeValueRequest;
import com.example.product.application.usecase.GetCategoryTreeUseCase;
import com.example.product.application.util.SlugUtil;
import com.example.product.infrastructure.messaging.ProductEventPublisher;
import com.example.product.infrastructure.persistence.entity.CategoryAttributeJpaEntity;
import com.example.product.infrastructure.persistence.entity.CategoryClosureId;
import com.example.product.infrastructure.persistence.entity.CategoryClosureJpaEntity;
import com.example.product.infrastructure.persistence.entity.CategoryJpaEntity;
import com.example.product.infrastructure.persistence.repository.CategoryAttributeRepository;
import com.example.product.infrastructure.persistence.repository.CategoryClosureRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.product.infrastructure.persistence.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/categories")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryRepository categoryRepository;
    private final CategoryClosureRepository categoryClosureRepository;
    private final CategoryAttributeRepository categoryAttributeRepository;
    private final ProductEventPublisher eventPublisher;
    private final GetCategoryTreeUseCase getCategoryTreeUseCase;

    @GetMapping
    public ApiResponse<Object> getAllCategories() {
        return ApiResponse.success(categoryRepository.findAll());
    }

    @GetMapping("/list")
    public ApiResponse<Object> getCategoriesList() {
        return ApiResponse.success(categoryRepository.findAll());
    }

    @GetMapping("/tree")
    public ApiResponse<Object> getCategoryTree() {
        return ApiResponse.success(getCategoryTreeUseCase.execute());
    }

    @GetMapping("/{slug}")
    public ApiResponse<Object> getCategoryBySlug(@PathVariable String slug) {
        return categoryRepository.findBySlug(slug)
            .map(c -> ApiResponse.success((Object) c))
            .orElse(ApiResponse.error("Category not found"));
    }

    @GetMapping("/{categoryId}/attributes")
    public ApiResponse<Object> getCategoryAttributes(@PathVariable Long categoryId) {
        var attrs = categoryAttributeRepository.findByCategoryId(categoryId);
        return ApiResponse.success(attrs);
    }

    @GetMapping("/attributes/global")
    public ApiResponse<Object> getGlobalAttributes() {
        return ApiResponse.success(categoryAttributeRepository.findAll());
    }

    @GetMapping("/attributes/{attributeId}")
    public ApiResponse<Object> getAttributeById(@PathVariable Long attributeId) {
        return categoryAttributeRepository.findById(attributeId)
            .map(a -> ApiResponse.success((Object) a))
            .orElse(ApiResponse.error("Attribute not found"));
    }

    @PutMapping("/attributes/{attributeId}")
    public ApiResponse<Object> updateAttribute(
            @PathVariable Long attributeId,
            @RequestBody CategoryAttributeRequest request) {
        var attr = categoryAttributeRepository.findById(attributeId)
            .orElseThrow(() -> new RuntimeException("Attribute not found"));
        attr.setName(request.getName());
        if (request.getValues() != null) {
            attr.setValuesCsv(String.join(",", request.getValues()));
        }
        return ApiResponse.success(categoryAttributeRepository.save(attr));
    }

    @DeleteMapping("/attributes/{attributeId}")
    public ApiResponse<Object> deleteAttribute(@PathVariable Long attributeId) {
        categoryAttributeRepository.deleteById(attributeId);
        return ApiResponse.success(null);
    }

    @PostMapping("/attributes")
    public ApiResponse<Object> createAttribute(@RequestBody CategoryAttributeWithCategoryRequest request) {
        var category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new RuntimeException("Category not found"));
        var attr = CategoryAttributeJpaEntity.builder()
            .category(category)
            .name(request.getName())
            .valuesCsv(request.getValues() != null ? String.join(",", request.getValues()) : null)
            .build();
        return ApiResponse.success(categoryAttributeRepository.save(attr));
    }

    @PostMapping("/attributes/values")
    public ApiResponse<Object> addAttributeValue(
            @RequestBody AttributeValueRequest request) {
        var attr = categoryAttributeRepository.findById(request.getAttributeId())
            .orElseThrow(() -> new RuntimeException("Attribute not found"));
        String existing = attr.getValuesCsv() != null ? attr.getValuesCsv() : "";
        String updated = existing.isBlank() ? request.getValue() : existing + "," + request.getValue();
        attr.setValuesCsv(updated);
        return ApiResponse.success(categoryAttributeRepository.save(attr));
    }

    @PutMapping("/attributes/values/{valueId}")
    public ApiResponse<Object> updateAttributeValue(
            @PathVariable Long valueId,
            @RequestBody AttributeValueRequest request) {
        var attr = categoryAttributeRepository.findById(valueId)
            .orElseThrow(() -> new RuntimeException("Attribute not found"));
        if (request.getValuesCsv() != null) {
            attr.setValuesCsv(request.getValuesCsv());
        }
        return ApiResponse.success(categoryAttributeRepository.save(attr));
    }

    @DeleteMapping("/attributes/values/{valueId}")
    public ApiResponse<Object> deleteAttributeValue(@PathVariable Long valueId) {
        categoryAttributeRepository.deleteById(valueId);
        return ApiResponse.success(null);
    }

    @PostMapping
    public ApiResponse<Object> createCategory(@RequestBody CategoryAdminRequest request) {
        CategoryJpaEntity category = new CategoryJpaEntity();
        category.setName(request.getName());
        category.setSlug(request.getSlug() != null ? request.getSlug() : SlugUtil.slugify(request.getName()));
        CategoryJpaEntity saved = categoryRepository.save(category);

        List<CategoryClosureJpaEntity> closures = new ArrayList<>();
        closures.add(buildClosure(saved.getId(), saved.getId(), 0));
        if (request.getParentId() != null) {
            if (!categoryRepository.existsById(request.getParentId())) {
                return ApiResponse.error("Parent category not found");
            }
            List<CategoryClosureJpaEntity> parentClosures = categoryClosureRepository.findByIdDescendantId(request.getParentId());
            for (CategoryClosureJpaEntity parentClosure : parentClosures) {
                closures.add(buildClosure(parentClosure.getId().getAncestorId(), saved.getId(), parentClosure.getDepth() + 1));
            }
        }
        categoryClosureRepository.saveAll(closures);

        saveCategoryAttributes(saved, request.getAttributes());
        eventPublisher.publishCategoryUpdated(Map.of("categoryId", saved.getId(), "slug", saved.getSlug(), "name", saved.getName()));
        return ApiResponse.success((Object)saved);
    }

    @PutMapping("/{id}")
    public ApiResponse<Object> updateCategory(@PathVariable Long id, @RequestBody CategoryAdminRequest request) {
        CategoryJpaEntity category = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found"));
        if (request.getName() != null) {
            category.setName(request.getName());
        }
        if (request.getSlug() != null) {
            category.setSlug(request.getSlug());
        }
        CategoryJpaEntity saved = categoryRepository.save(category);

        if (request.getParentId() != null) {
            if (!categoryRepository.existsById(request.getParentId())) {
                return ApiResponse.error("Parent category not found");
            }
            if (categoryClosureRepository.existsByIdAncestorIdAndDepthGreaterThan(id, 0)) {
                throw new RuntimeException("Cannot change parent for category with children");
            }
            categoryClosureRepository.deleteByIdDescendantId(id);
            List<CategoryClosureJpaEntity> closures = new ArrayList<>();
            closures.add(buildClosure(saved.getId(), saved.getId(), 0));
            List<CategoryClosureJpaEntity> parentClosures = categoryClosureRepository.findByIdDescendantId(request.getParentId());
            for (CategoryClosureJpaEntity parentClosure : parentClosures) {
                closures.add(buildClosure(parentClosure.getId().getAncestorId(), saved.getId(), parentClosure.getDepth() + 1));
            }
            categoryClosureRepository.saveAll(closures);
        }

        saveCategoryAttributes(saved, request.getAttributes());
        eventPublisher.publishCategoryUpdated(Map.of("categoryId", saved.getId(), "slug", saved.getSlug(), "name", saved.getName()));
        return ApiResponse.success((Object)saved);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteCategory(@PathVariable Long id) { 
        if (categoryClosureRepository.existsByIdAncestorIdAndDepthGreaterThan(id, 0)) {
            return ApiResponse.error("Category has children; delete children first");
        }
        categoryAttributeRepository.deleteByCategoryId(id);
        categoryClosureRepository.deleteByIdAncestorId(id);
        categoryClosureRepository.deleteByIdDescendantId(id);
        categoryRepository.deleteById(id);
        return ApiResponse.success(null); 
    }

    private CategoryClosureJpaEntity buildClosure(Long ancestorId, Long descendantId, int depth) {
        CategoryClosureJpaEntity entity = new CategoryClosureJpaEntity();
        entity.setId(new CategoryClosureId(ancestorId, descendantId));
        entity.setDepth(depth);
        entity.setAncestor(categoryRepository.getReferenceById(ancestorId));
        entity.setDescendant(categoryRepository.getReferenceById(descendantId));
        return entity;
    }

    private void saveCategoryAttributes(CategoryJpaEntity category, List<CategoryAttributeRequest> attributes) {
        categoryAttributeRepository.deleteByCategoryId(category.getId());
        if (attributes == null || attributes.isEmpty()) {
            return;
        }
        List<CategoryAttributeJpaEntity> entities = new ArrayList<>();
        for (CategoryAttributeRequest attr : attributes) {
            CategoryAttributeJpaEntity entity = new CategoryAttributeJpaEntity();
            entity.setCategory(category);
            entity.setName(attr.getName());
            if (attr.getValues() != null && !attr.getValues().isEmpty()) {
                entity.setValuesCsv(String.join(",", attr.getValues()));
            }
            entities.add(entity);
        }
        categoryAttributeRepository.saveAll(entities);
    }
}
