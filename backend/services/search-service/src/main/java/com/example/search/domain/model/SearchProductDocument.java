package com.example.search.domain.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "search_index")
public class SearchProductDocument {
    @Id
    private Long id;
    private String name;
    private String slug;
    private Double basePrice;
    private String categorySlug;
    private String brandSlug;
    private boolean onSale;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}