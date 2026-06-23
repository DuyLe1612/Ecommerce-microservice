package com.example.product.domain.model.product;

import com.example.product.domain.exception.DomainException;
import com.example.product.domain.valueobject.Money;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import com.example.product.domain.enums.*;

/**
 * Aggregate Root for Product
 */
public class Product {
    private ProductId id;
    private Long categoryId;
    private Long brandId;
    private String name;
    private String slug;
    private Money basePrice;
    private ProductStatus status;
    private String description;
    private java.math.BigDecimal discountPercent;
    private String overview;
    private com.fasterxml.jackson.databind.JsonNode specs;
    private Double averageRating;
    private Integer totalReviews;
    
    private final List<ProductVariant> variants;
    private final List<ProductImage> images;

    // For restoring from DB
    public Product(ProductId id, Long categoryId, Long brandId, String name, String slug, Money basePrice, ProductStatus status, String description, List<ProductVariant> variants, List<ProductImage> images, java.math.BigDecimal discountPercent, String overview, com.fasterxml.jackson.databind.JsonNode specs, Double averageRating, Integer totalReviews) {
        this.id = id;
        this.categoryId = categoryId;
        this.brandId = brandId;
        this.name = name;
        this.slug = slug;
        this.basePrice = basePrice;
        this.status = status;
        this.description = description;
        this.variants = variants != null ? new ArrayList<>(variants) : new ArrayList<>();
        this.images = images != null ? new ArrayList<>(images) : new ArrayList<>();
        this.discountPercent = discountPercent;
        this.overview = overview;
        this.specs = specs;
        this.averageRating = averageRating;
        this.totalReviews = totalReviews;
    }

    // For creating new
    public Product(Long categoryId, Long brandId, String name, String slug, Money basePrice) {
        if (name == null || name.trim().isEmpty()) {
            throw new DomainException("Product name cannot be empty");
        }
        if (categoryId == null || brandId == null) {
            throw new DomainException("Product must belong to a Category and a Brand");
        }
        
        this.categoryId = categoryId;
        this.brandId = brandId;
        this.name = name;
        this.slug = slug;
        this.basePrice = basePrice;
        this.status = ProductStatus.DRAFT;
        
        this.variants = new ArrayList<>();
        this.images = new ArrayList<>();
        this.averageRating = 0.0;
        this.totalReviews = 0;
    }

    // Invariants & Behaviors
    
    public void publish() {
        if (variants.isEmpty()) {
            throw new DomainException("Cannot publish a product without variants");
        }
        if (images.stream().noneMatch(ProductImage::isPrimary)) {
            throw new DomainException("Product must have at least one primary image to be published");
        }
        this.status = ProductStatus.AVAILABLE;
    }

    public void addVariant(ProductVariant variant) {
        boolean skuExists = variants.stream()
            .anyMatch(v -> v.getSku().equals(variant.getSku()));
        if (skuExists) {
            throw new DomainException("Variant with SKU " + variant.getSku().getValue() + " already exists in this product");
        }
        this.variants.add(variant);
    }

    public void addImage(ProductImage image) {
        if (image.isPrimary()) {
            this.images.forEach(ProductImage::removePrimary);
        } else if (this.images.isEmpty()) {
            image.makePrimary();
        }
        this.images.add(image);
    }

    public void updateDetails(String description, String overview, com.fasterxml.jackson.databind.JsonNode specs, java.math.BigDecimal discountPercent) {
        this.description = description;
        this.overview = overview;
        this.specs = specs;
        this.discountPercent = discountPercent;
    }

    // Getters
    public ProductId getId() { return id; }
    public Long getCategoryId() { return categoryId; }
    public Long getBrandId() { return brandId; }
    public String getName() { return name; }
    public String getSlug() { return slug; }
    public Money getBasePrice() { return basePrice; }
    public ProductStatus getStatus() { return status; }
    public String getDescription() { return description; }
    public java.math.BigDecimal getDiscountPercent() { return discountPercent; }
    public String getOverview() { return overview; }
    public com.fasterxml.jackson.databind.JsonNode getSpecs() { return specs; }
    public Double getAverageRating() { return averageRating; }
    public Integer getTotalReviews() { return totalReviews; }
    
    public List<ProductVariant> getVariants() {
        return Collections.unmodifiableList(variants);
    }
    
    public List<ProductImage> getImages() {
        return Collections.unmodifiableList(images);
    }
}
