package com.example.search.presentation.rest;

import com.example.search.application.usecase.SearchQueryUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class SearchController {

    private final SearchQueryUseCase searchQueryUseCase;

    @GetMapping
    public Object listProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String categorySlug,
            @RequestParam(required = false) String brandSlug,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "newest") String sort) {
            
        return searchQueryUseCase.listProducts(keyword, categorySlug, brandSlug, minPrice, maxPrice, page, size, sort);
    }

    @GetMapping("/on-sale")
    public Object onSaleProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return searchQueryUseCase.onSaleProducts(page, size);
    }

    @GetMapping("/new/{categorySlug}")
    public Object newProducts(
            @PathVariable String categorySlug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return searchQueryUseCase.newProducts(categorySlug, page, size);
    }
}
