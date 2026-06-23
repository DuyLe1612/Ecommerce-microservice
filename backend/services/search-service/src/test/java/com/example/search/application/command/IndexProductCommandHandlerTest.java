package com.example.search.application.command;

import com.example.search.domain.model.ProductDocument;
import com.example.search.domain.repository.ProductSearchRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class IndexProductCommandHandlerTest {

    @Mock
    private ProductSearchRepository productSearchRepository;

    @InjectMocks
    private IndexProductCommandHandler handler;

    @Test
    void testHandle() {
        ProductDocument doc = new ProductDocument();
        doc.setId("1");
        IndexProductCommand command = new IndexProductCommand(doc);

        handler.execute(command);

        verify(productSearchRepository).save(any(ProductDocument.class));
    }
}
