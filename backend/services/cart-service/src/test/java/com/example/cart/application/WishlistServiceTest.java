package com.example.cart.application;

import com.example.cart.domain.WishlistItem;
import com.example.cart.infrastructure.persistence.WishlistRepository;
import com.example.cart.infrastructure.product.ProductClient;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class WishlistServiceTest {
    @Test
    void addValidatesProductAndIsIdempotentWhenAlreadyPresent() {
        WishlistRepository repository = mock(WishlistRepository.class);
        ProductClient productClient = mock(ProductClient.class);
        WishlistService service = new WishlistService(repository, productClient);

        when(repository.existsByUserIdAndProductId("42", 99L)).thenReturn(true);
        when(repository.findByUserIdOrderByCreatedAtDesc("42")).thenReturn(List.of(
            WishlistItem.builder().userId("42").productId(99L).createdAt(LocalDateTime.now()).build()
        ));

        var result = service.add("42", 99L);

        verify(productClient).ensureProductExists(99L);
        verify(repository, never()).save(any());
        assertEquals(1, result.size());
        assertEquals(99L, result.getFirst().productId());
    }
}
