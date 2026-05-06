package com.example.product.domain.model.category;

import lombok.Data;

/**
 * Aggregate Root for Category
 */
@Data
public class Category {
    private Long id;
    private String name;
    private String slug;
    
    public Category() {}

    public Category(Long id, String name, String slug) {
        this.id = id;
        this.name = name;
        this.slug = slug;
    }
}
