package com.example.search.application.query;

import com.example.search.application.dto.SearchResponse;
import com.example.search.domain.model.ProductDocument;
import com.example.search.domain.repository.ProductSearchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SearchProductsQueryHandler {
    private final ProductSearchRepository repository;

    public SearchResponse<ProductDocument> execute(SearchProductsQuery query) {
        return (SearchResponse<ProductDocument>) repository.search(
            query.getQ(),
            query.getCategoryId(),
            query.getBrandId(),
            query.getMinPrice(),
            query.getMaxPrice(),
            query.getStatus(),
            query.getPage(),
            query.getSize()
        );
    }
}
