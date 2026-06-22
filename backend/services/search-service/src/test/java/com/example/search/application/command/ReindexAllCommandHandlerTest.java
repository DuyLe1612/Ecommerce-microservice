package com.example.search.application.command;

import com.example.search.domain.model.ProductDocument;
import com.example.search.domain.repository.ProductSearchRepository;
import com.example.search.infrastructure.external.ProductServiceClient;
import com.example.search.infrastructure.external.dto.IndexFeedResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReindexAllCommandHandlerTest {

    @Mock
    private ProductSearchRepository productSearchRepository;

    @Mock
    private ProductServiceClient productServiceClient;

    @InjectMocks
    private ReindexAllCommandHandler handler;

    @Test
    void testExecute_withOrphans() {
        // Mock existing ids in elasticsearch
        Set<String> existingIds = new HashSet<>(Set.of("100", "200", "300"));
        when(productSearchRepository.findAllIds()).thenReturn(existingIds);

        // Mock product-service index feed response
        IndexFeedResponse.ProductFeedDto product1 = new IndexFeedResponse.ProductFeedDto();
        product1.setId("100");
        product1.setName("Product 100");

        IndexFeedResponse.ProductFeedDto product2 = new IndexFeedResponse.ProductFeedDto();
        product2.setId("400");
        product2.setName("Product 400");

        IndexFeedResponse response = new IndexFeedResponse();
        response.setContent(List.of(product1, product2));
        response.setTotalPages(1);

        when(productServiceClient.getIndexFeed(anyInt(), anyInt(), any())).thenReturn(response);

        // Execute
        int count = handler.execute(new ReindexAllCommand());

        // Assert
        assertEquals(2, count);
        verify(productSearchRepository).saveAll(any());
        
        // Orphan logic check: "200" and "300" should be deleted
        verify(productSearchRepository).deleteAllById(argThat(list -> list.contains("200") && list.contains("300") && list.size() == 2));
    }
}
