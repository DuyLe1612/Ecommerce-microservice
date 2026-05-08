package com.example.product.application.usecase;

import com.example.product.infrastructure.messaging.ProductEventPublisher;
import com.example.product.domain.event.ProductEventV1;
import com.example.product.infrastructure.persistence.entity.ProductJpaEntity;
import com.example.product.infrastructure.persistence.repository.SpringDataProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UpdateProductUseCase {
    private final SpringDataProductRepository repository;
    private final ProductEventPublisher eventPublisher;

    @Transactional
    public Object execute(Long id, String newName) {
        ProductJpaEntity product = repository.findById(id).orElseThrow();
        product.setName(newName);
        repository.save(product);

        eventPublisher.publishProductUpdated(ProductEventV1.builder()
                .eventVersion("v1")
                .eventType("product.updated")
                .productId(product.getId())
                .name(newName)
                .build());
        return product;
    }
}
