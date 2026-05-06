package com.example.product.domain;

public final class Constants {
    private Constants() {}

    public static final String EXCHANGE_PRODUCT_EVENTS = "product.events";
    public static final String EXCHANGE_CATALOG_EVENTS = "catalog.events";
    
    public static final String ROUTING_KEY_PRODUCT_CREATED = "product.created";
    public static final String ROUTING_KEY_PRODUCT_UPDATED = "product.updated";
    public static final String ROUTING_KEY_PRODUCT_DELETED = "product.deleted";
    
    public static final String ROUTING_KEY_CATEGORY_UPDATED = "category.updated";
    
    public static final String CACHE_PRODUCT_DETAIL = "product:detail";
}
