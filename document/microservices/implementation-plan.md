# Microservices Implementation Plan (Full API Coverage)

Scope: migrate all APIs in document/APIdocs/apidocs.json into 10 microservices
- auth-service
- product-service
- search-service
- promotion-service
- coupon-service
- cart-service
- order-service
- payment-service
- review-service
- notification-service

## Phase 0 - Platform baseline (1 week)
1. Finalize service boundaries and endpoint ownership (see api-docs.md and SERVICE-MAPPING.md files).
2. Infrastructure baseline:
- PostgreSQL (multi DB): auth_db, product_db, search_db, promotion_db, coupon_db, cart_db, order_db, payment_db, review_db, notification_db
- Redis
- RabbitMQ
- Gateway (Nginx)
3. Platform standards:
- traceId propagation
- error envelope contract
- idempotency policy for payment and webhook APIs
4. CI baseline:
- lint/test/build per service
- compose smoke test

Deliverables:
- docker compose up works end-to-end
- gateway route skeleton for all service prefixes
- service env templates and health checks

## Phase 1 - Identity + catalog write model + campaign split (2-3 weeks)

### 1A) auth-service (full API parity)
Implement:
- /api/auth/login
- /api/auth/register
- /api/profile
- /api/profile/all
- /api/profile/email
- /api/profile/password
- /api/profile/addresses
- /api/profile/addresses/{addressId}
- /api/profile/addresses/{addressId}/default
- /api/locations/provinces
- /api/locations/provinces/{provinceCode}/districts
- /api/locations/districts/{districtCode}/wards
- /api/admin/locations/import
- /api/admin/training-seed/users

### 1B) product-service (write-heavy and detail APIs)
Implement:
- /api/products/{slug}
- /api/products/variants/{variantId}
- /api/categories
- /api/categories/list
- /api/categories/tree
- /api/categories/{id}/attributes
- /api/categories/{slug}
- /api/categories/{slug}/attributes
- /api/brands
- /api/brands/list
- /api/brands/{slug}
- /api/brands/by-category/{categorySlug}
- /api/blog
- /api/blog/{id}/related
- /api/blog/{slug}
- /api/blog/recent
- /api/blog/tag/{tag}
- /api/cloudinary
- /api/cloudinary/category-icon
- /api/cloudinary/product-image
- /api/admin/products
- /api/admin/products/{id}
- /api/admin/products/{slug}
- /api/admin/products/images
- /api/admin/products/images/{imageId}
- /api/admin/products/images/reorder
- /api/admin/products/variants
- /api/admin/products/variants/{variantId}
- /api/admin/categories
- /api/admin/categories/{categoryId}/attributes
- /api/admin/categories/{slug}
- /api/admin/categories/attributes
- /api/admin/categories/attributes/{attributeId}
- /api/admin/categories/attributes/global
- /api/admin/categories/attributes/values
- /api/admin/categories/attributes/values/{valueId}
- /api/admin/categories/create
- /api/admin/categories/delete
- /api/admin/categories/list
- /api/admin/categories/tree
- /api/admin/categories/update
- /api/admin/brands
- /api/admin/brands/{slug}
- /api/admin/brands/create
- /api/admin/brands/delete
- /api/admin/brands/list
- /api/admin/brands/update
- /api/admin/blog
- /api/admin/blog/{id}
- /api/admin/blog/{id}/publish
- /api/admin/blog/{id}/unpublish

### 1C) promotion-service (new split)
Implement:
- /api/advertisements
- /api/advertisements/active
- /api/advertisements/position/{position}
- /api/admin/promotions
- /api/admin/promotions/{id}
- /api/admin/promotions/{id}/activate
- /api/admin/promotions/{id}/pause
- /api/admin/promotions/active
- /api/admin/advertisements
- /api/admin/advertisements/{id}
- /api/admin/advertisements/{id}/activate
- /api/admin/advertisements/{id}/deactivate

### 1D) coupon-service (new split)
Implement:
- /api/coupons
- /api/coupons/{code}
- /api/coupons/check/{code}
- /api/coupons/for-category/{categoryId}
- /api/coupons/for-product/{productId}
- /api/coupons/validate
- /api/admin/coupons
- /api/admin/coupons/{id}
- /api/admin/coupons/{id}/activate
- /api/admin/coupons/{id}/deactivate
- /api/admin/coupons/{id}/statistics
- /api/admin/coupons/{id}/usage

Deliverables:
- auth + product + promotion + coupon parity through gateway
- no cross-service database access

## Phase 2 - Search + cart + review (2 weeks)

### 2A) search-service (new split)
Implement:
- /api/products
- /api/products/new/{categorySlug}
- /api/products/on-sale
- /api/recommend/cf/{userId}
- /api/recommend/cf/products/{userId}
- /api/recommend/content/{userId}
- /api/recommend/content/products/{userId}
- /api/recommend/predict/{productId}

### 2B) cart-service
Implement:
- /api/cart
- /api/cart/items
- /api/cart/items/{variantId}
- /api/wishlist
- /api/wishlist/check/{productId}
- /api/wishlist/items
- /api/wishlist/items/{productId}

### 2C) review-service
Implement:
- /api/products/{productId}/reviews
- /api/products/{productId}/reviews/{reviewId}
- /api/products/{productId}/reviews/{reviewId}/vote
- /api/products/{productId}/reviews/can-review
- /api/products/{productId}/reviews/summary
- /api/admin/reviews/{reviewId}/approve
- /api/admin/reviews/{reviewId}/reject
- /api/admin/reviews/product/{productId}

Deliverables:
- search/recommend APIs decoupled from product write model
- cart and review APIs fully isolated

## Phase 3 - Order + payment saga (2-3 weeks)

### 3A) order-service
Implement:
- /api/orders/{orderNumber}
- /api/orders/by-id/{orderId}
- /api/orders/create
- /api/orders/history
- /api/admin/orders
- /api/admin/orders/{orderId}
- /api/admin/orders/{orderId}/cancel
- /api/admin/orders/{orderId}/deliver
- /api/admin/orders/{orderId}/ship
- /api/admin/orders/{orderId}/status
- /api/admin/orders/statistics
- /api/admin/statistics
- /api/admin/statistics/category-revenue
- /api/admin/statistics/filters
- /api/admin/statistics/invalidate-cache
- /api/admin/statistics/overview
- /api/admin/statistics/product-performance
- /api/admin/statistics/recent-orders
- /api/admin/statistics/revenue-chart
- /api/admin/statistics/revenue/last-days/{numberOfDays}
- /api/admin/statistics/revenue/last-months/{numberOfMonths}
- /api/admin/statistics/revenue/last-weeks/{numberOfWeeks}
- /api/admin/statistics/top-customers
- /api/admin/statistics/top-products

### 3B) payment-service
Implement:
- /api/payment/callback
- /api/payment/gateways
- /api/payment/order/{orderId}/status
- /api/payment/process
- /api/payment/status/{transactionId}
- /api/payment/vnpay/ipn
- /api/v1/payments/vnpay-ipn
- /api/v1/payments/vnpay-return
- /api/admin/payments
- /api/admin/payments/{id}
- /api/admin/payments/check-timeouts
- /api/admin/payments/statistics
- /api/admin/payments/timeout-statistics
- /api/admin/payments/transaction/{transactionId}

### 3C) Saga/event contract implementation
- order-service publish: OrderCreated, OrderCancelled, OrderShipped, OrderDelivered, OrderCompleted
- payment-service publish: PaymentSuccess, PaymentFailed, PaymentRefunded
- order-service consume payment events and update order state machine
- promotion-service consume OrderCompleted for usage counters
- notification-service consume final business events for user notifications

### 3D) Idempotency (mandatory)
- payment process and callback endpoints use Idempotency-Key + unique transaction constraints
- callback replay returns previous status (no double charge)

Deliverables:
- reliable checkout flow without duplicate charge
- order/payment state consistency under retry and callback replay

## Phase 4 - Notification + hardening (1-2 weeks)

### 4A) notification-service
- No public API in current OpenAPI
- Implement async consumers and delivery pipeline:
  - UserRegistered
  - PaymentSuccess/PaymentFailed
  - OrderShipped/OrderDelivered
  - ReviewApproved (optional)

### 4B) Reliability and observability
- Gateway rate limit (optional per route)
- Retry with exponential backoff for consumers
- DLQ and replay tooling
- Metrics: latency, queue lag, consumer failure count, payment timeout count
- Structured logs with traceId/requestId

Deliverables:
- production-ready operations baseline
- incident playbook and replay procedures

## Inter-service integration matrix (required)

### Sync calls
- search-service -> product-service (canonical product projection)
- search-service -> promotion-service (promotion visibility for search cards)
- promotion-service -> product-service (scope validation)
- coupon-service -> product-service (coupon scope validation)
- order-service -> cart-service (checkout snapshot)
- order-service -> coupon-service (coupon validation snapshot)
- payment-service -> order-service (order state verification)
- review-service -> order-service (verified purchase check)

### Async flows
- product-service -> search-service: ProductCreated/ProductUpdated/ProductDeleted
- promotion-service -> search-service: PromotionActivated/PromotionPaused
- order-service -> coupon-service: OrderCompleted
- order-service -> payment-service: OrderCreated
- payment-service -> order-service: PaymentSuccess/PaymentFailed
- order-service/payment-service/review-service -> notification-service: business events

## Migration strategy (strangler)
1. Keep monolith fallback routes behind feature flags.
2. Move traffic prefix-by-prefix at gateway.
3. Shadow test and compare response contract before cutover.
4. Rollback by route switch if error budget exceeded.

## Team assignment (4 developers, module-based, updated)

### Dev 1 - Identity and edge
- gateway + auth-service
- owns JWT verify, route policy, auth/profile/location APIs

### Dev 2 - Product + search
- product-service + search-service
- owns product/category/brand/blog/media and search/recommend read model

### Dev 3 - Promotion + cart
- promotion-service + coupon-service + cart-service
- owns promotions/ads, coupon domain, and cart/wishlist + checkout coupon integration

### Dev 4 - Order + payment + review + notification
- order-service, payment-service, review-service, notification-service
- owns saga, idempotency, review moderation, async delivery pipeline

## Quality gates and success criteria
- 100% API paths from OpenAPI mapped to exactly one owner service.
- Zero cross-service DB access in code review and runtime checks.
- Payment idempotency passes concurrency/retry test suite.
- Gateway is the only public entrypoint.
- Contract tests pass for all migrated routes.
