package com.example.product.domain.model.product;

import com.example.product.domain.enums.ProductStatus;
import com.example.product.domain.valueobject.Money;
import com.example.product.domain.valueobject.Sku;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public class ProductVariant {
    private Long id;
    private Sku sku;
    private Money price;
    private ProductStatus status;
    private Map<String, Object> variantSpecsJson;
    private List<VariantAttributeValue> attributeValues;

    // For restoring from DB
    public ProductVariant(Long id, Sku sku, Money price, ProductStatus status, Map<String, Object> variantSpecsJson, List<VariantAttributeValue> attributeValues) {
        this.id = id;
        this.sku = sku;
        this.price = price;
        this.status = status;
        this.variantSpecsJson = variantSpecsJson;
        this.attributeValues = attributeValues != null ? new ArrayList<>(attributeValues) : new ArrayList<>();
    }

    // For creating new
    public ProductVariant(Sku sku, Money price, Map<String, Object> variantSpecsJson, List<VariantAttributeValue> attributeValues) {
        if (sku == null || price == null) {
            throw new IllegalArgumentException("SKU and Price must not be null");
        }
        this.sku = sku;
        this.price = price;
        this.status = ProductStatus.AVAILABLE;
        this.variantSpecsJson = variantSpecsJson;
        this.attributeValues = attributeValues != null ? new ArrayList<>(attributeValues) : new ArrayList<>();
    }

    public Long getId() { return id; }
    public Sku getSku() { return sku; }
    public Money getPrice() { return price; }
    public ProductStatus getStatus() { return status; }
    public Map<String, Object> getVariantSpecsJson() { return variantSpecsJson; }
    public List<VariantAttributeValue> getAttributeValues() { return Collections.unmodifiableList(attributeValues); }

    public void changePrice(Money newPrice) {
        if (newPrice == null) {
            throw new IllegalArgumentException("New price cannot be null");
        }
        this.price = newPrice;
    }

    public void updateDetails(Map<String, Object> variantSpecsJson, List<VariantAttributeValue> attributeValues) {
        this.variantSpecsJson = variantSpecsJson;
        this.attributeValues = attributeValues != null ? new ArrayList<>(attributeValues) : new ArrayList<>();
    }
    
    public void deactivate() {
        this.status = ProductStatus.DISCONTINUED;
    }
}
