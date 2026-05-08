# API to Service Mapping (Gateway -> Microservices)

Source: document/APIdocs/apidocs.json

## 1) Service split (latest)
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

## 2) Gateway routing summary
- /api/auth, /api/profile, /api/locations -> auth-service
- /api/products (listing/search), /api/products/new/*, /api/products/on-sale, /api/recommend/* -> search-service
- /api/products/* (detail/variant/admin product write), /api/categories/*, /api/brands/*, /api/blog/*, /api/cloudinary/* -> product-service
- /api/coupons/*, /api/admin/coupons* -> coupon-service
- /api/advertisements/*, /api/admin/promotions*, /api/admin/advertisements* -> promotion-service
- /api/cart/*, /api/wishlist/* -> cart-service
- /api/orders/*, /api/admin/orders*, /api/admin/statistics* -> order-service
- /api/payment/*, /api/v1/payments/*, /api/admin/payments* -> payment-service
- /api/products/{productId}/reviews*, /api/admin/reviews* -> review-service
- /api/notifications/* (future) -> notification-service

## 3) Full API ownership inventory (all paths)

### auth-service
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

### product-service
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

### search-service
- /api/products
- /api/products/new/{categorySlug}
- /api/products/on-sale
- /api/recommend/cf/{userId}
- /api/recommend/cf/products/{userId}
- /api/recommend/content/{userId}
- /api/recommend/content/products/{userId}
- /api/recommend/predict/{productId}

### promotion-service
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

### coupon-service
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

### cart-service
- /api/cart
- /api/cart/items
- /api/cart/items/{variantId}
- /api/wishlist
- /api/wishlist/check/{productId}
- /api/wishlist/items
- /api/wishlist/items/{productId}

### order-service
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

### payment-service
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

### review-service
- /api/products/{productId}/reviews
- /api/products/{productId}/reviews/{reviewId}
- /api/products/{productId}/reviews/{reviewId}/vote
- /api/products/{productId}/reviews/can-review
- /api/products/{productId}/reviews/summary
- /api/admin/reviews/{reviewId}/approve
- /api/admin/reviews/{reviewId}/reject
- /api/admin/reviews/product/{productId}

### notification-service
- Current OpenAPI has no public endpoint.
- Reserved future prefix: /api/notifications/*

## 4) Inter-service call rules after split

### Sync HTTP (when required)
- search-service -> product-service (canonical detail projection backfill)
- search-service -> promotion-service (active promo/ads visibility for cards)
- promotion-service -> product-service (validate product/category scope)
- coupon-service -> product-service (validate product/category coupon scope)
- order-service -> cart-service (cart snapshot at checkout)
- order-service -> coupon-service (coupon validation snapshot)
- payment-service -> order-service (order state verification before process)
- review-service -> order-service (verified purchase check)

### Async events (recommended)
- order-service publish: OrderCreated, OrderCancelled, OrderShipped, OrderDelivered, OrderCompleted
- payment-service consume: OrderCreated (optional); publish: PaymentSuccess, PaymentFailed, PaymentRefunded
- order-service consume: PaymentSuccess, PaymentFailed, PaymentRefunded
- coupon-service consume: OrderCompleted
- search-service consume: ProductCreated/ProductUpdated/ProductDeleted, PromotionActivated/PromotionPaused
- notification-service consume: UserRegistered, OrderShipped, OrderDelivered, PaymentSuccess, PaymentFailed, ReviewApproved

## 5) Per-service mapping docs in code folders
- backend/services/auth-service/SERVICE-MAPPING.md
- backend/services/product-service/SERVICE-MAPPING.md
- backend/services/search-service/SERVICE-MAPPING.md
- backend/services/promotion-service/SERVICE-MAPPING.md
- backend/services/coupon-service/SERVICE-MAPPING.md
- backend/services/cart-service/SERVICE-MAPPING.md
- backend/services/order-service/SERVICE-MAPPING.md
- backend/services/payment-service/SERVICE-MAPPING.md
- backend/services/review-service/SERVICE-MAPPING.md
- backend/services/notification-service/SERVICE-MAPPING.md

## 6) Gateway boundaries
Gateway should do:
- route forwarding
- logging and trace headers
- basic JWT check
- optional rate limit

Gateway should not do:
- business logic
- database access
- complex orchestration

## 7) Response contract baseline
Use common envelope for errors:

```json
{
  "success": false,
  "message": "..."
}
```
