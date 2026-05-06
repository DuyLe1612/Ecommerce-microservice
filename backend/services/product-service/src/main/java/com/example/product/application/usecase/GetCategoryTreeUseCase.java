package com.example.product.application.usecase;

import com.example.product.application.dto.CategoryTreeNode;
import com.example.product.infrastructure.persistence.entity.CategoryClosureJpaEntity;
import com.example.product.infrastructure.persistence.entity.CategoryJpaEntity;
import com.example.product.infrastructure.persistence.repository.CategoryClosureRepository;
import com.example.product.infrastructure.persistence.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;

import java.util.*;

/**
 * Trade-off documentation for Closure Table vs Nested Set:
 * 
 * Closure Table Pattern was chosen over Nested Set because:
 * 1. Simpler to query for ancestors and descendants (just join on ancestor_id/descendant_id).
 * 2. Easier to insert/delete nodes compared to Nested Set, which requires recalculating
 *    the left and right boundaries for potentially the entire tree.
 * 3. Trade-off: Closure table requires more storage space (O(N^2) in worst case for a deep tree),
 *    but our requirement specifies a max depth of 4 levels, making the storage overhead negligible.
 */
@UseCase
@RequiredArgsConstructor
public class GetCategoryTreeUseCase {
    private final CategoryRepository categoryRepository;
    private final CategoryClosureRepository categoryClosureRepository;

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

        List<CategoryClosureJpaEntity> parents = categoryClosureRepository.findByDepth(1);
        Set<Long> childIds = new HashSet<>();
        for (CategoryClosureJpaEntity rel : parents) {
            Long childId = rel.getId().getDescendantId();
            Long parentId = rel.getId().getAncestorId();
            CategoryTreeNode child = nodes.get(childId);
            CategoryTreeNode parent = nodes.get(parentId);
            if (child != null && parent != null) {
                parent.getChildren().add(child);
                childIds.add(childId);
            }
        }

        List<CategoryTreeNode> roots = new ArrayList<>();
        for (CategoryTreeNode node : nodes.values()) {
            if (!childIds.contains(node.getId())) {
                roots.add(node);
            }
        }
        return roots;
    }
}
