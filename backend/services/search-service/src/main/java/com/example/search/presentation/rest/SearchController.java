package com.example.search.presentation.rest;

import com.example.search.application.dto.ApiResponse;
import com.example.search.application.dto.SearchResponse;
import com.example.search.application.query.SearchProductsQuery;
import com.example.search.application.query.SearchProductsQueryHandler;
import com.example.search.domain.model.ProductDocument;
import com.example.search.domain.repository.ProductSearchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchProductsQueryHandler searchProductsQueryHandler;
    private final ProductSearchRepository repository;

    @GetMapping("/products")
    public ApiResponse<SearchResponse<ProductDocument>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String brandId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        SearchProductsQuery query = SearchProductsQuery.builder()
                .q(q)
                .categoryId(categoryId)
                .brandId(brandId)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .status(status)
                .sortBy(sortBy)
                .sortDir(sortDir)
                .page(page)
                .size(size)
                .build();
                
        return ApiResponse.success(searchProductsQueryHandler.execute(query));
    }

    @GetMapping("/suggest")
    public ApiResponse<Object> suggest(@RequestParam String q, @RequestParam(defaultValue = "5") int size) {
        return ApiResponse.success(repository.suggest(q, size));
    }

    @GetMapping("/facets")
    public ApiResponse<Object> facets() {
        return ApiResponse.success(repository.aggregateFacets());
    }
}
