package com.example.product.application.usecase;

import com.example.product.application.dto.CategoryTreeNode;
import com.example.product.infrastructure.persistence.entity.CategoryJpaEntity;
import com.example.product.infrastructure.persistence.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;

import java.util.*;

@UseCase
@RequiredArgsConstructor
public class GetCategoryTreeUseCase {
    private final CategoryRepository categoryRepository;

    public List<CategoryTreeNode> execute() {
        List<CategoryJpaEntity> categories = categoryRepository.findAll();
        if (categories.isEmpty()) {
            return List.of();
        }

        Map<Long, CategoryTreeNode> nodes = new HashMap<>();
        for (CategoryJpaEntity category : categories) {
            CategoryTreeNode node = new CategoryTreeNode();
            node.setId(category.getId());
            node.setName(category.getName());
            node.setSlug(category.getSlug());
            nodes.put(category.getId(), node);
        }

        List<CategoryTreeNode> roots = new ArrayList<>();
        for (CategoryJpaEntity category : categories) {
            CategoryTreeNode node = nodes.get(category.getId());
            if (category.getParentId() == null) {
                roots.add(node);
            } else {
                CategoryTreeNode parent = nodes.get(category.getParentId());
                if (parent != null) {
                    parent.getChildren().add(node);
                } else {
                    roots.add(node); // Fallback if parent is missing
                }
            }
        }
        return roots;
    }
}
