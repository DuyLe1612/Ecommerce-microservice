package com.example.search.domain;

public final class SearchConstants {
    private SearchConstants() {}

    public static final String EXCHANGE_PRODUCT_EVENTS = "product.events";
    public static final String EXCHANGE_PROMOTION_EVENTS = "promotion.events";

    public static final String ROUTING_KEY_PRODUCT_CREATED = "product.created";
    public static final String ROUTING_KEY_PRODUCT_UPDATED = "product.updated";
    public static final String ROUTING_KEY_PRODUCT_DELETED = "product.deleted";

    public static final String ROUTING_KEY_PROMOTION_ACTIVATED = "promotion.activated";
    public static final String ROUTING_KEY_PROMOTION_PAUSED = "promotion.paused";

    public static final String QUEUE_PRODUCT_CREATED = "search.product.created";
    public static final String QUEUE_PRODUCT_UPDATED = "search.product.updated";
    public static final String QUEUE_PRODUCT_DELETED = "search.product.deleted";
    public static final String QUEUE_PROMOTION_ACTIVATED = "search.promotion.activated";
    public static final String QUEUE_PROMOTION_PAUSED = "search.promotion.paused";
}
