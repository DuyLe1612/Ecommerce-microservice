package com.example.search.presentation.messaging;

import com.example.search.application.command.DeleteProductIndexCommand;
import com.example.search.application.command.DeleteProductIndexCommandHandler;
import com.example.search.application.command.IndexProductCommand;
import com.example.search.application.command.IndexProductCommandHandler;
import com.example.search.domain.repository.ProductSearchRepository;
import com.example.search.infrastructure.external.ProductServiceClient;
import com.example.search.infrastructure.external.dto.IndexFeedResponse;
import com.example.search.infrastructure.messaging.ProductEventConsumer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageProperties;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductEventConsumerTest {

    @Mock
    private ProductServiceClient productServiceClient;
    @Mock
    private IndexProductCommandHandler indexProductCommandHandler;
    @Mock
    private DeleteProductIndexCommandHandler deleteProductIndexCommandHandler;
    @Mock
    private ProductSearchRepository repository;

    @InjectMocks
    private ProductEventConsumer consumer;

    @Test
    void testHandleProductDeleted() {
        Map<String, Object> event = new HashMap<>();
        event.put("id", "123");

        MessageProperties props = new MessageProperties();
        props.setReceivedRoutingKey("product.deleted");
        Message message = new Message(new byte[0], props);

        consumer.handleProductEvent(event, message);

        verify(deleteProductIndexCommandHandler).execute(any(DeleteProductIndexCommand.class));
    }

    @Test
    void testHandleProductCreated() {
        Map<String, Object> event = new HashMap<>();
        event.put("slug", "test-product");

        MessageProperties props = new MessageProperties();
        props.setReceivedRoutingKey("product.created");
        Message message = new Message(new byte[0], props);

        IndexFeedResponse.ProductFeedDto dto = new IndexFeedResponse.ProductFeedDto();
        dto.setId("123");
        dto.setSlug("test-product");
        when(productServiceClient.getProductBySlug("test-product")).thenReturn(dto);

        consumer.handleProductEvent(event, message);

        verify(indexProductCommandHandler).execute(any(IndexProductCommand.class));
    }
}
