package com.example.product.infrastructure.persistence.repository;

import com.example.product.application.dto.ProductAdminRequest;
import com.example.product.application.dto.ProductImageReorderRequest;
import com.example.product.application.dto.ProductImageUpdateRequest;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import com.example.product.domain.model.product.Product;
import com.example.product.domain.valueobject.Money;
import com.example.product.domain.exception.DomainException;
import com.example.product.infrastructure.persistence.mapper.ProductMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import com.example.product.application.dto.VariantAttributeValueRequest;
import com.example.product.infrastructure.persistence.entity.ProductVariantAttributeJpaEntity;

@Repository
@RequiredArgsConstructor
public class ProductCommandRepositoryImpl implements ProductCommandRepository {
    private final SpringDataProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductImageRepository imageRepository;
    private final ProductAttributeRepository attributeRepository;
    private final CloudinaryGateway cloudinaryGateway;
    private final ProductMapper productMapper;

    @Autowired
    private CacheManager cacheManager;

    private void evictProductCache(String slug) {
        var cache = cacheManager.getCache("product_detail"); // Assume this is Constants.CACHE_PRODUCT_DETAIL
        if (cache != null && slug != null) {
            cache.evict(slug);
        }
    }

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
        Money basePrice = new Money(request.getBasePrice(), "VND");
        Product product = new Product(
            request.getCategoryId(),
            request.getBrandId(),
            request.getName(),
            request.getSlug() != null ? request.getSlug() : slugifyOrNull(request.getName()),
            basePrice
        );
        
        if (productRepository.existsBySlug(product.getSlug())) {
            throw new DomainException("Slug already exists: " + product.getSlug());
        }
        
        ProductJpaEntity entity = productMapper.toEntity(product);
        entity.setDescription(request.getDescription());
        entity.setStatus(request.getStatus() != null ? request.getStatus() : "DRAFT");
        ProductJpaEntity saved = productRepository.save(entity);
        return toEvent(saved, "product.created");
    }

    @Override
    @Transactional
    public ProductEventV1 updateProduct(Long id, ProductAdminRequest request) {
        ProductJpaEntity existing = productRepository.findById(id)
                .orElseThrow(() -> new DomainException("Product not found"));
                
        String newSlug = request.getSlug() != null ? request.getSlug() : existing.getSlug();
        if (productRepository.existsBySlugAndIdNot(newSlug, id)) {
            throw new DomainException("Slug already exists: " + newSlug);
        }
        
        Money basePrice = new Money(request.getBasePrice() != null ? request.getBasePrice() : existing.getBasePrice(), "VND");
        Product product = new Product(
            request.getCategoryId() != null ? request.getCategoryId() : existing.getCategoryId(),
            request.getBrandId() != null ? request.getBrandId() : existing.getBrandId(),
            request.getName() != null ? request.getName() : existing.getName(),
            newSlug,
            basePrice
        );
        
        ProductJpaEntity entity = productMapper.toEntity(product);
        entity.setId(id);
        entity.setDescription(request.getDescription() != null ? request.getDescription() : existing.getDescription());
        entity.setStatus(request.getStatus() != null ? request.getStatus() : existing.getStatus());
        entity.setCreatedAt(existing.getCreatedAt()); // Preserve createdAt
        
        ProductJpaEntity saved = productRepository.save(entity);
        evictProductCache(saved.getSlug());
        return toEvent(saved, "product.updated");
    }

    @Override
    @Transactional
    public ProductEventV1 deleteProduct(Long id) {
        ProductJpaEntity product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        productRepository.deleteById(id);
        evictProductCache(product.getSlug());
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
                .isPrimary(primaryFlag)
                .sortOrder(nextSortOrder)
                .build();
        return imageRepository.save(image);
    }

    @Override
    @Transactional
    public Object updateImage(Long imageId, ProductImageUpdateRequest request) {
        ProductImageJpaEntity image = imageRepository.findById(imageId)
            .orElseThrow(() -> new RuntimeException("Image not found: " + imageId));
        
        if (Boolean.TRUE.equals(request.getIsPrimary()) && !Boolean.TRUE.equals(image.getIsPrimary())) {
            List<ProductImageJpaEntity> siblings = imageRepository.findByProductId(image.getProduct().getId());
            siblings.forEach(img -> img.setIsPrimary(false));
            imageRepository.saveAll(siblings);
            image.setIsPrimary(true);
        }
        if (request.getSortOrder() != null) {
            image.setSortOrder(request.getSortOrder());
        }
        return imageRepository.save(image);
    }

    @Override
    @Transactional
    public void deleteImage(Long imageId) {
        ProductImageJpaEntity image = imageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));
        // TODO: Extract publicId from image.getImageUrl() if Cloudinary deletion is required.
        // if (image.getPublicId() != null && !image.getPublicId().isBlank()) {
        //     cloudinaryGateway.destroy(image.getPublicId());
        // }
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

        if (request.getAttributeValues() != null && !request.getAttributeValues().isEmpty()) {
            List<ProductAttributeJpaEntity> validAttributes = attributeRepository.findByCategoryIdOrIsGlobalTrue(product.getCategoryId());
            List<Long> validAttributeIds = validAttributes.stream().map(ProductAttributeJpaEntity::getId).collect(Collectors.toList());
            for (VariantAttributeValueRequest attrReq : request.getAttributeValues()) {
                if (!validAttributeIds.contains(attrReq.getAttributeId())) {
                    throw new DomainException("Attribute " + attrReq.getAttributeId() + " is not valid for this product's category");
                }
            }
        }

        ProductVariantJpaEntity variant = ProductVariantJpaEntity.builder()
                .product(product)
                .sku(request.getSku())
                .price(request.getPrice())
                .stock(request.getStock() != null ? request.getStock() : 0)
                .status(request.getStatus() != null ? request.getStatus() : "available")
                .variantSpecsJson(request.getVariantSpecsJson())
                .build();

        if (request.getAttributeValues() != null) {
            List<ProductVariantAttributeJpaEntity> attrEntities = request.getAttributeValues().stream()
                    .map(attr -> new ProductVariantAttributeJpaEntity(
                            null,
                            attr.getAttributeId(),
                            attr.getValueId()
                    ))
                    .collect(Collectors.toList());
            variant.setAttributeValues(attrEntities);
        }

        return variantRepository.save(variant);
    }

    @Override
    @Transactional
    public Object updateVariant(Long variantId, ProductVariantRequest request) {
        ProductVariantJpaEntity variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found"));
                
        if (request.getAttributeValues() != null && !request.getAttributeValues().isEmpty()) {
            List<ProductAttributeJpaEntity> validAttributes = attributeRepository.findByCategoryIdOrIsGlobalTrue(variant.getProduct().getCategoryId());
            List<Long> validAttributeIds = validAttributes.stream().map(ProductAttributeJpaEntity::getId).collect(Collectors.toList());
            for (VariantAttributeValueRequest attrReq : request.getAttributeValues()) {
                if (!validAttributeIds.contains(attrReq.getAttributeId())) {
                    throw new DomainException("Attribute " + attrReq.getAttributeId() + " is not valid for this product's category");
                }
            }
        }

        if (request.getSku() != null) variant.setSku(request.getSku());
        if (request.getPrice() != null) variant.setPrice(request.getPrice());
        if (request.getStock() != null) variant.setStock(request.getStock());
        if (request.getStatus() != null) variant.setStatus(request.getStatus());
        if (request.getVariantSpecsJson() != null) variant.setVariantSpecsJson(request.getVariantSpecsJson());
        
        if (request.getAttributeValues() != null) {
            variant.getAttributeValues().clear();
            List<ProductVariantAttributeJpaEntity> attrEntities = request.getAttributeValues().stream()
                    .map(attr -> new ProductVariantAttributeJpaEntity(
                            variant.getId(),
                            attr.getAttributeId(),
                            attr.getValueId()
                    ))
                    .collect(Collectors.toList());
            variant.getAttributeValues().addAll(attrEntities);
        }
        
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
