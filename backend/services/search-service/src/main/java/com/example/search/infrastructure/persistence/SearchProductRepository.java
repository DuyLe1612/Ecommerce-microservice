package com.example.search.infrastructure.persistence;

import com.example.search.domain.model.SearchProductDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface SearchProductRepository extends JpaRepository<SearchProductDocument, Long>, JpaSpecificationExecutor<SearchProductDocument> {
    
    // PostgreSQL Full Text Search syntax simulation
    @Query(value = "SELECT * FROM search_index WHERE to_tsvector('simple', name) @@ plainto_tsquery('simple', :keyword)", nativeQuery = true)
    List<SearchProductDocument> searchByKeyword(@Param("keyword") String keyword);
    
    Page<SearchProductDocument> findByOnSaleTrue(Pageable pageable);

    Page<SearchProductDocument> findByCategorySlugOrderByCreatedAtDesc(String categorySlug, Pageable pageable);

    List<SearchProductDocument> findByCategorySlug(String categorySlug);

    java.util.Optional<SearchProductDocument> findBySlug(String slug);
}