package com.example.product.domain.model.product;

import com.example.product.domain.enums.ProductStatus;
import com.example.product.domain.valueobject.Money;
import com.example.product.domain.valueobject.Sku;

public class ProductVariant {
    private Long id;
    private Sku sku;
    private Money price;
    private ProductStatus status;

    // For restoring from DB
    public ProductVariant(Long id, Sku sku, Money price, ProductStatus status) {
        this.id = id;
        this.sku = sku;
        this.price = price;
        this.status = status;
    }

    // For creating new
    public ProductVariant(Sku sku, Money price) {
        if (sku == null || price == null) {
            throw new IllegalArgumentException("SKU and Price must not be null");
        }
        this.sku = sku;
        this.price = price;
        this.status = ProductStatus.AVAILABLE;
    }

    public Long getId() { return id; }
    public Sku getSku() { return sku; }
    public Money getPrice() { return price; }
    public ProductStatus getStatus() { return status; }

    public void changePrice(Money newPrice) {
        if (newPrice == null) {
            throw new IllegalArgumentException("New price cannot be null");
        }
        this.price = newPrice;
    }
    
    public void deactivate() {
        this.status = ProductStatus.DISCONTINUED;
    }
}
