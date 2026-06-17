package com.example.product.application.usecase;

import com.example.product.application.dto.ProductAdminRequest;
import com.example.product.application.dto.ProductImageReorderRequest;
import com.example.product.application.dto.ProductImageUpdateRequest;
import com.example.product.application.dto.ProductVariantRequest;
import com.example.product.domain.event.ProductEventV1;
import com.example.product.domain.repository.ProductCommandRepository;
import com.example.product.infrastructure.messaging.ProductEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductCommandUseCase {
    private final ProductCommandRepository repository;
    private final ProductEventPublisher eventPublisher;

    public List<?> listProducts() {
        return repository.listProducts();
    }

    public Object getProduct(Long id) {
        return repository.getProduct(id);
    }

    public Object createProduct(ProductAdminRequest request) {
        ProductEventV1 event = repository.createProduct(request);
        eventPublisher.publishProductCreated(event);
        log.info("event=product_created productId={} slug={}", event.getProductId(), event.getSlug());
        return repository.getProduct(event.getProductId());
    }

    public Object updateProduct(Long id, ProductAdminRequest request) {
        ProductEventV1 event = repository.updateProduct(id, request);
        eventPublisher.publishProductUpdated(event);
        log.info("event=product_updated productId={} slug={}", event.getProductId(), event.getSlug());
        return repository.getProduct(event.getProductId());
    }

    public void deleteProduct(Long id) {
        ProductEventV1 event = repository.deleteProduct(id);
        eventPublisher.publishProductDeleted(event);
        log.info("event=product_deleted productId={} slug={}", event.getProductId(), event.getSlug());
    }

    public Object uploadImage(Long productId, MultipartFile file, Boolean isPrimary) {
        Object saved = repository.uploadImage(productId, file, isPrimary);
        ProductEventV1 event = ProductEventV1.builder().eventVersion("v1").eventType("product.updated").productId(productId).build();
        eventPublisher.publishProductUpdated(event);
        return saved;
    }

    public Object updateImage(Long imageId, ProductImageUpdateRequest request) {
        return repository.updateImage(imageId, request);
    }

    public void deleteImage(Long imageId) {
        repository.deleteImage(imageId);
    }

    public void reorderImages(ProductImageReorderRequest request) {
        repository.reorderImages(request);
        if (request.getProductId() != null) {
            ProductEventV1 event = ProductEventV1.builder().eventVersion("v1").eventType("product.updated").productId(request.getProductId()).build();
            eventPublisher.publishProductUpdated(event);
        }
    }

    public Object addVariant(ProductVariantRequest request) {
        Object saved = repository.addVariant(request);
        if (request.getProductId() != null) {
            ProductEventV1 event = ProductEventV1.builder().eventVersion("v1").eventType("product.updated").productId(request.getProductId()).build();
            eventPublisher.publishProductUpdated(event);
        }
        return saved;
    }

    public Object updateVariant(Long variantId, ProductVariantRequest request) {
        Object saved = repository.updateVariant(variantId, request);
        if (request.getProductId() != null) {
            ProductEventV1 event = ProductEventV1.builder().eventVersion("v1").eventType("product.updated").productId(request.getProductId()).build();
            eventPublisher.publishProductUpdated(event);
        }
        return saved;
    }

    public void deleteVariant(Long variantId) {
        repository.deleteVariant(variantId);
    }

    public Object getVariant(Long variantId) {
        return repository.getVariant(variantId);
    }
}
