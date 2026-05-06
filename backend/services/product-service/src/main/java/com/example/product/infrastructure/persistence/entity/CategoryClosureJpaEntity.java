package com.example.product.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "category_closure")
@Data
public class CategoryClosureJpaEntity {
    
    @EmbeddedId
    private CategoryClosureId id;
    
    @Column(nullable = false)
    private Integer depth;

    @MapsId("ancestorId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ancestor_id", insertable = false, updatable = false)
    private CategoryJpaEntity ancestor;

    @MapsId("descendantId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "descendant_id", insertable = false, updatable = false)
    private CategoryJpaEntity descendant;
}
