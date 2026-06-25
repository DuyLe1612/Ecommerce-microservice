package com.example.search.domain.repository;

import com.example.search.domain.model.ProductDocument;
import java.util.List;
import java.util.Set;

public interface ProductSearchRepository {
    void save(ProductDocument product);
    void saveAll(List<ProductDocument> products);
    void deleteById(String id);
    void deleteAllById(List<String> ids);
    Set<String> findAllIds();
    Object search(String query, String categoryId, String brandId, Double minPrice, Double maxPrice, String status, String sortBy, String sortDir, int page, int size);
    Object suggest(String prefix, int size);
    Object aggregateFacets();
    void updateCategoryName(String categoryId, String categoryName);
}
