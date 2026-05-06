package com.example.product.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryClosureId implements Serializable {

    @Column(name = "ancestor_id")
    private Long ancestorId;

    @Column(name = "descendant_id")
    private Long descendantId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CategoryClosureId that = (CategoryClosureId) o;
        return Objects.equals(ancestorId, that.ancestorId) &&
               Objects.equals(descendantId, that.descendantId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(ancestorId, descendantId);
    }
}
