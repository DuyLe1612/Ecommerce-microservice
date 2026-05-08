package com.example.product.infrastructure.persistence.mapper;

import com.example.product.domain.model.product.*;
import com.example.product.domain.enums.ProductStatus;
import com.example.product.domain.valueobject.Money;
import com.example.product.domain.valueobject.Sku;
import com.example.product.infrastructure.persistence.entity.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ProductMapper {

    public Product toDomain(ProductJpaEntity entity) {
        List<ProductVariant> variants = entity.getVariants().stream()
                .map(v -> new ProductVariant(
                        v.getId(),
                        new Sku(v.getSku()),
                        new Money(v.getPrice(), "VND"), // Assuming VND logic from Monolith
                        ProductStatus.valueOf(v.getStatus().toUpperCase())
                ))
                .collect(Collectors.toList());

        List<ProductImage> images = entity.getImages().stream()
                .map(i -> new ProductImage(
                        i.getId(),
                        i.getImageUrl(),
                        i.getIsPrimary(),
                        i.getSortOrder()
                ))
                .collect(Collectors.toList());

        return new Product(
                new ProductId(entity.getId()),
                entity.getCategoryId(),
                entity.getBrandId(),
                entity.getName(),
                entity.getSlug(),
                new Money(entity.getBasePrice(), "VND"),
                ProductStatus.valueOf(entity.getStatus().toUpperCase()),
                entity.getDescription(),
                variants,
                images
        );
    }

    public ProductJpaEntity toEntity(Product domain) {
        ProductJpaEntity entity = new ProductJpaEntity();
        if (domain.getId() != null) {
            entity.setId(domain.getId().getValue());
        }
        entity.setCategoryId(domain.getCategoryId());
        entity.setBrandId(domain.getBrandId());
        entity.setName(domain.getName());
        entity.setSlug(domain.getSlug());
        entity.setBasePrice(domain.getBasePrice().getAmount());
        entity.setStatus(domain.getStatus().name().toLowerCase());
        entity.setDescription(domain.getDescription());
        
        List<ProductVariantJpaEntity> variantEntities = domain.getVariants().stream()
                .map(v -> {
                    ProductVariantJpaEntity ve = new ProductVariantJpaEntity();
                    ve.setId(v.getId());
                    ve.setProduct(entity);
                    ve.setSku(v.getSku().getValue());
                    ve.setPrice(v.getPrice().getAmount());
                    ve.setStatus(v.getStatus().name().toLowerCase());
                    ve.setStock(0); // Stock managed externally, keeping default
                    return ve;
                })
                .collect(Collectors.toList());
        entity.setVariants(variantEntities);

        List<ProductImageJpaEntity> imageEntities = domain.getImages().stream()
                .map(i -> {
                    ProductImageJpaEntity ie = new ProductImageJpaEntity();
                    ie.setId(i.getId());
                    ie.setProduct(entity);
                    ie.setImageUrl(i.getImageUrl());
                    ie.setIsPrimary(i.isPrimary());
                    ie.setSortOrder(i.getSortOrder());
                    return ie;
                })
                .collect(Collectors.toList());
        entity.setImages(imageEntities);

        return entity;
    }
}
