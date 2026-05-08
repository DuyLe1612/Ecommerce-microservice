# Service Mapping - order-service

## Folder should contain
- API module(s): order lifecycle and admin order management
- persistence: order_db for orders, items, status transitions, history
- integration: checkout orchestrator, status policy, admin reports (temporary)

## API ownership (from OpenAPI)
- POST /api/orders/create
- GET /api/orders/history
- GET /api/orders/{orderNumber}
- GET /api/orders/by-id/{orderId}
- GET /api/admin/orders
- GET /api/admin/orders/{orderId}
- POST /api/admin/orders/{orderId}/cancel
- POST /api/admin/orders/{orderId}/ship
- POST /api/admin/orders/{orderId}/deliver
- PUT /api/admin/orders/{orderId}/status
- GET /api/admin/orders/statistics
- GET /api/admin/statistics
- GET /api/admin/statistics/overview
- GET /api/admin/statistics/filters
- GET /api/admin/statistics/recent-orders
- GET /api/admin/statistics/top-products
- GET /api/admin/statistics/top-customers
- GET /api/admin/statistics/category-revenue
- GET /api/admin/statistics/revenue-chart
- GET /api/admin/statistics/revenue/last-days/{numberOfDays}
- GET /api/admin/statistics/revenue/last-weeks/{numberOfWeeks}
- GET /api/admin/statistics/revenue/last-months/{numberOfMonths}
- GET /api/admin/statistics/product-performance
- POST /api/admin/statistics/invalidate-cache

## Sync calls to other services
- cart-service: fetch selected items for order creation.
- promotion-service: validate coupon snapshot and discount eligibility.
- payment-service: query payment status in synchronous fallback path only.

## Async integration
- Publish: OrderCreated, OrderCancelled, OrderShipped, OrderDelivered, OrderCompleted.
- Consume: PaymentSuccess, PaymentFailed, PaymentRefunded.