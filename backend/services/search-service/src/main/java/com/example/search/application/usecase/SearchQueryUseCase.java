package com.example.search.application.usecase;

import com.example.search.domain.model.SearchProductDocument;
import com.example.search.infrastructure.persistence.SearchProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class SearchQueryUseCase {
    private final SearchProductRepository repository;

    public Object listProducts(String keyword, String categorySlug, String brandSlug, Double minPrice, Double maxPrice, int page, int size, String sort) {
        Specification<SearchProductDocument> spec = Specification.where(null);
        if (StringUtils.hasText(keyword)) {
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("name")), "%" + keyword.toLowerCase() + "%"));
        }
        if (StringUtils.hasText(categorySlug)) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("categorySlug"), categorySlug));
        }
        if (StringUtils.hasText(brandSlug)) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("brandSlug"), brandSlug));
        }
        if (minPrice != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("basePrice"), minPrice));
        }
        if (maxPrice != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("basePrice"), maxPrice));
        }
        Sort sortOrder = Sort.by("id").descending();
        if ("price_asc".equals(sort)) sortOrder = Sort.by("basePrice").ascending();
        else if ("price_desc".equals(sort)) sortOrder = Sort.by("basePrice").descending();
        return repository.findAll(spec, PageRequest.of(page, size, sortOrder));
    }

    @Cacheable(value = "search:on-sale", key = "#page + '-' + #size")
    public Object onSaleProducts(int page, int size) {
        return repository.findByOnSaleTrue(PageRequest.of(page, size, Sort.by("updatedAt").descending()));
    }

    public Object newProducts(String categorySlug, int page, int size) {
        return repository.findByCategorySlugOrderByCreatedAtDesc(categorySlug, PageRequest.of(page, size));
    }
}
