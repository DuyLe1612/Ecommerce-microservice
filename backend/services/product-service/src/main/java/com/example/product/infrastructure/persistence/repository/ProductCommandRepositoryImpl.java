package com.example.product.infrastructure.persistence.repository;

import com.example.product.application.dto.ProductAdminRequest;
import com.example.product.application.dto.ProductImageReorderRequest;
import com.example.product.application.dto.ProductVariantRequest;
import com.example.product.domain.event.ProductEventV1;
import com.example.product.domain.repository.ProductCommandRepository;
import com.example.product.domain.external.CloudinaryGateway;
import com.example.product.infrastructure.persistence.entity.ProductAttributeJpaEntity;
import com.example.product.infrastructure.persistence.entity.ProductImageJpaEntity;
import com.example.product.infrastructure.persistence.entity.ProductJpaEntity;
import com.example.product.infrastructure.persistence.entity.ProductVariantJpaEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Repository
@RequiredArgsConstructor
public class ProductCommandRepositoryImpl implements ProductCommandRepository {
    private final SpringDataProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductImageRepository imageRepository;
    private final ProductAttributeRepository attributeRepository;
    private final CloudinaryGateway cloudinaryGateway;

    @Override
    public List<?> listProducts() {
        return productRepository.findAll();
    }

    @Override
    public Object getProduct(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    @Override
    @Transactional
    public ProductEventV1 createProduct(ProductAdminRequest request) {
        ProductJpaEntity product = new ProductJpaEntity();
        product.setName(request.getName());
        product.setSlug(request.getSlug() != null ? request.getSlug() : slugifyOrNull(request.getName()));
        product.setCategoryId(request.getCategoryId());
        product.setBrandId(request.getBrandId());
        product.setBasePrice(request.getBasePrice());
        product.setDescription(request.getDescription());
        product.setStatus(request.getStatus() != null ? request.getStatus() : "draft");

        ProductJpaEntity saved = productRepository.save(product);
        saveAttributes(saved, request.getAttributes());
        return toEvent(saved, "product.created");
    }

    @Override
    @Transactional
    public ProductEventV1 updateProduct(Long id, ProductAdminRequest request) {
        ProductJpaEntity product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        if (request.getName() != null) product.setName(request.getName());
        if (request.getSlug() != null) product.setSlug(request.getSlug());
        if (request.getCategoryId() != null) product.setCategoryId(request.getCategoryId());
        if (request.getBrandId() != null) product.setBrandId(request.getBrandId());
        if (request.getBasePrice() != null) product.setBasePrice(request.getBasePrice());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getStatus() != null) product.setStatus(request.getStatus());
        ProductJpaEntity saved = productRepository.save(product);
        saveAttributes(saved, request.getAttributes());
        return toEvent(saved, "product.updated");
    }

    @Override
    @Transactional
    public ProductEventV1 deleteProduct(Long id) {
        ProductJpaEntity product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        attributeRepository.deleteByProductId(id);
        productRepository.deleteById(id);
        return toEvent(product, "product.deleted");
    }

    @Override
    @Transactional
    public Object uploadImage(Long productId, MultipartFile file, Boolean isPrimary) {
        ProductJpaEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        var upload = cloudinaryGateway.upload(file, "products/" + productId);
        List<ProductImageJpaEntity> existing = imageRepository.findByProductId(productId);
        boolean primaryFlag = Boolean.TRUE.equals(isPrimary) || existing.isEmpty();
        if (primaryFlag) {
            for (ProductImageJpaEntity img : existing) img.setIsPrimary(false);
            imageRepository.saveAll(existing);
        }
        int nextSortOrder = existing.stream()
                .map(ProductImageJpaEntity::getSortOrder)
                .filter(Objects::nonNull)
                .max(Integer::compareTo).orElse(0) + 1;
        ProductImageJpaEntity image = ProductImageJpaEntity.builder()
                .product(product)
                .imageUrl(upload.getUrl())
                .publicId(upload.getPublicId())
                .isPrimary(primaryFlag)
                .sortOrder(nextSortOrder)
                .build();
        return imageRepository.save(image);
    }

    @Override
    @Transactional
    public void deleteImage(Long imageId) {
        ProductImageJpaEntity image = imageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));
        if (image.getPublicId() != null && !image.getPublicId().isBlank()) {
            cloudinaryGateway.destroy(image.getPublicId());
        }
        imageRepository.deleteById(imageId);
    }

    @Override
    @Transactional
    public void reorderImages(ProductImageReorderRequest request) {
        if (request.getOrderedImageIds() == null) return;
        int order = 0;
        for (Long imageId : request.getOrderedImageIds()) {
            int sortOrder = order++;
            imageRepository.findById(imageId).ifPresent(img -> {
                img.setSortOrder(sortOrder);
                imageRepository.save(img);
            });
        }
    }

    @Override
    @Transactional
    public Object addVariant(ProductVariantRequest request) {
        if (variantRepository.existsBySku(request.getSku())) {
            throw new RuntimeException("SKU already exists");
        }
        ProductJpaEntity product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        ProductVariantJpaEntity variant = ProductVariantJpaEntity.builder()
                .product(product)
                .sku(request.getSku())
                .price(request.getPrice())
                .stock(request.getStock() != null ? request.getStock() : 0)
                .status(request.getStatus() != null ? request.getStatus() : "available")
                .build();
        return variantRepository.save(variant);
    }

    @Override
    @Transactional
    public Object updateVariant(Long variantId, ProductVariantRequest request) {
        ProductVariantJpaEntity variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found"));
        if (request.getSku() != null) variant.setSku(request.getSku());
        if (request.getPrice() != null) variant.setPrice(request.getPrice());
        if (request.getStock() != null) variant.setStock(request.getStock());
        if (request.getStatus() != null) variant.setStatus(request.getStatus());
        return variantRepository.save(variant);
    }

    @Override
    @Transactional
    public void deleteVariant(Long variantId) {
        variantRepository.deleteById(variantId);
    }

    @Override
    public Object getVariant(Long variantId) {
        return variantRepository.findById(variantId).orElse(null);
    }

    private void saveAttributes(ProductJpaEntity product, Map<String, String> attributes) {
        attributeRepository.deleteByProductId(product.getId());
        if (attributes == null || attributes.isEmpty()) return;
        List<ProductAttributeJpaEntity> items = new ArrayList<>();
        for (Map.Entry<String, String> entry : attributes.entrySet()) {
            ProductAttributeJpaEntity attr = ProductAttributeJpaEntity.builder()
                    .product(product)
                    .name(entry.getKey())
                    .value(entry.getValue())
                    .build();
            items.add(attr);
        }
        attributeRepository.saveAll(items);
    }

    private ProductEventV1 toEvent(ProductJpaEntity product, String eventType) {
        return ProductEventV1.builder()
                .eventVersion("v1")
                .eventType(eventType)
                .productId(product.getId())
                .slug(product.getSlug())
                .name(product.getName())
                .basePrice(product.getBasePrice())
                .categoryId(product.getCategoryId())
                .brandId(product.getBrandId())
                .status(product.getStatus())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    private String slugifyOrNull(String name) {
        return name == null ? null : name.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-+|-+$", "");
    }
}
