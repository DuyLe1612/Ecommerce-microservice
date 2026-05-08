package com.example.product.domain.model.product;

public class ProductImage {
    private Long id;
    private String imageUrl;
    private boolean isPrimary;
    private int sortOrder;

    // For restoring from DB
    public ProductImage(Long id, String imageUrl, boolean isPrimary, int sortOrder) {
        this.id = id;
        this.imageUrl = imageUrl;
        this.isPrimary = isPrimary;
        this.sortOrder = sortOrder;
    }

    // For creating new
    public ProductImage(String imageUrl, boolean isPrimary, int sortOrder) {
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            throw new IllegalArgumentException("ImageUrl cannot be empty");
        }
        this.imageUrl = imageUrl;
        this.isPrimary = isPrimary;
        this.sortOrder = sortOrder;
    }

    public Long getId() { return id; }
    public String getImageUrl() { return imageUrl; }
    public boolean isPrimary() { return isPrimary; }
    public int getSortOrder() { return sortOrder; }

    void makePrimary() {
        this.isPrimary = true;
    }

    void removePrimary() {
        this.isPrimary = false;
    }
}
