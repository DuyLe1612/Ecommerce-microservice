# Service Mapping - coupon-service

## Folder should contain
- API module(s): public coupon read/validate APIs, admin coupon management
- persistence: coupon_db for definitions, conditions, activation, usage counters
- integration: coupon validation rules, redemption/idempotency controls

## API ownership (from OpenAPI)
- GET /api/coupons
- GET /api/coupons/{code}
- GET /api/coupons/check/{code}
- GET /api/coupons/for-category/{categoryId}
- GET /api/coupons/for-product/{productId}
- POST /api/coupons/validate
- GET /api/admin/coupons
- POST /api/admin/coupons
- GET /api/admin/coupons/{id}
- PUT /api/admin/coupons/{id}
- DELETE /api/admin/coupons/{id}
- PATCH /api/admin/coupons/{id}/activate
- PATCH /api/admin/coupons/{id}/deactivate
- GET /api/admin/coupons/{id}/statistics
- GET /api/admin/coupons/{id}/usage

## Sync calls to other services
- product-service: validate category/product scope.
- order-service: optional read for usage analytics by order state.

## Async integration
- Consume: OrderCompleted to confirm coupon redemption.
- Publish: CouponActivated, CouponDeactivated, CouponRedeemed.
