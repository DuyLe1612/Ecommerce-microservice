package com.example.search.application.query;

import com.example.search.application.dto.SearchResponse;
import com.example.search.domain.model.ProductDocument;
import com.example.search.domain.repository.ProductSearchRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SearchProductsQueryHandlerTest {

    @Mock
    private ProductSearchRepository productSearchRepository;

    @InjectMocks
    private SearchProductsQueryHandler handler;

    @Test
    void testHandle() {
        SearchProductsQuery query = new SearchProductsQuery("query", "cat", "brand", 0.0, 100.0, "ACTIVE", 0, 10, "createdAt", "DESC");
        
        SearchResponse<ProductDocument> mockResponse = new SearchResponse<>(List.of(new ProductDocument()), 1, 1, 10, 0);
        when(productSearchRepository.search(any(), any(), any(), any(), any(), any(), any(), any(), anyInt(), anyInt())).thenReturn(mockResponse);

        SearchResponse<ProductDocument> result = handler.execute(query);

        assertEquals(1, result.getTotalElements());
    }
}
