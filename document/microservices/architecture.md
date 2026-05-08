# Ecommerce Microservices Architecture

## 1) Architectural principles
- API Gateway is the single entry point.
- Domain-driven split (DDD-lite) by bounded context.
- Database per service (logical isolation on one PostgreSQL server, multiple DBs).
- Prefer synchronous HTTP first.
- Use asynchronous messaging (RabbitMQ) only where reliability and decoupling are needed.

## 2) Core stack
- Gateway: Nginx
- Services: language/framework per service (independent)
- DB: PostgreSQL (single server, multiple DBs)
- Cache: Redis
- Queue: RabbitMQ
- Container: Docker + Docker Compose

## 3) High-level component map
- gateway
  - Routing
  - Access logging
  - JWT verification (basic)
  - Optional rate limit
- auth-service
  - Auth, profile, identity
- product-service
  - Product domain write model, categories, brands, blog, media
- search-service
  - Product search, listing, recommendation read model
- promotion-service
  - Promotions and advertisements
- coupon-service
  - Coupons and coupon lifecycle
- order-service
  - Orders and order lifecycle
- payment-service
  - Payment initiation, callback, reconciliation
- cart-service
  - Cart and wishlist
- review-service
  - Product reviews and moderation
- notification-service
  - Async notifications (email/SMS/push)

## 4) Data isolation
- auth-service -> auth_db
- product-service -> product_db
- search-service -> search_db
- promotion-service -> promotion_db
- coupon-service -> coupon_db
- order-service -> order_db
- payment-service -> payment_db
- cart-service -> cart_db
- review-service -> review_db
- notification-service -> notification_db

Rules:
- No cross-service DB query.
- No direct schema dependency between services.
- Cross-domain data must be accessed via API or events.

## 5) Communication model
### Sync (HTTP)
Use for:
- CRUD and query flows
- low-latency reads

Risk:
- cascade failure if upstream service is down

### Async (RabbitMQ)
Use for:
- Order -> Payment orchestration events
- Order/Payment -> Notification events
- Retry and eventual consistency scenarios

Reference event flow:
1. order-service publishes `OrderCreated`.
2. payment-service consumes `OrderCreated`, creates payment attempt.
3. payment-service publishes `PaymentSuccess` or `PaymentFailed`.
4. order-service consumes payment event, updates order status.
5. coupon-service consumes `OrderCompleted` to update coupon usage metrics.
6. search-service consumes product/promotion/coupon events to refresh query projections.
7. notification-service consumes final status event and sends message.

## 6) Gateway boundaries
Gateway should do:
- route forwarding
- logging and trace headers
- basic auth check
- optional traffic policy (rate limit)

Gateway should not do:
- business logic
- database access
- complex orchestration (except simple BFF aggregation if needed)
