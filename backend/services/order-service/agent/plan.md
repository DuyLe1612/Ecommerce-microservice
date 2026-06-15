order-service	"Create Order
(checkout saga entry)"	POST /api/orders/create	"REST HTTP (authenticated)
Sync HTTP (outbound) × 3
Async → RabbitMQ (publish)"	"cart-service (GET /internal/cart/{userId}/snapshot)
coupon-service (POST /internal/coupons/validate)
auth-service (GET /internal/addresses/{userId})
RabbitMQ publish: OrderCreated"	"Flow:
1. Snapshot cart từ cart-service (sync)
2. Validate coupon nếu có (sync coupon-service)
3. Lấy shipping address từ auth-service
4. Tạo order record với status=PENDING_PAYMENT
5. Publish OrderCreated → payment-service
Idempotency key: X-Idempotency-Key header.
Transaction DB để đảm bảo atomic."	"• POST /api/orders/create hoạt động end-to-end
• Idempotency: duplicate request trả same orderId
• 3 sync calls thành công
• OrderCreated event published
• Rollback nếu bất kỳ sync call fail
• Integration test"
order-service	"Order read APIs
(user + admin)"	"GET /api/orders/{orderNumber}
GET /api/orders/by-id/{orderId}
GET /api/orders/history
GET /api/admin/orders
GET /api/admin/orders/{orderId}"	REST HTTP (authenticated + admin)	Gateway	"History: paginate, filter by status, sort by date.
Admin list: filter by status, date range, customer.
Order detail include: items, shipping, payment status (denormalized từ payment-service)."	"• 5 read endpoints
• Paginate + filter
• Admin role check
• Unit tests"
order-service	"Order state machine
(admin actions + event consume)"	"POST /api/admin/orders/{orderId}/cancel
POST /api/admin/orders/{orderId}/ship
POST /api/admin/orders/{orderId}/deliver
PUT /api/admin/orders/{orderId}/status"	"REST HTTP (admin)
Async ← RabbitMQ (consume)
Async → RabbitMQ (publish)"	"Gateway
payment-service (consume PaymentSuccess/PaymentFailed/PaymentRefunded)
coupon-service (publish OrderCompleted)
notification-service (publish OrderShipped, OrderDelivered, OrderCancelled)"	"State machine:
PENDING_PAYMENT → PAID (on PaymentSuccess)
PAID → SHIPPING (on ship action)
SHIPPING → DELIVERED (on deliver action)
Any → CANCELLED (on cancel, nếu được phép)
Consume PaymentSuccess/Failed từ payment-service.
Publish OrderCompleted sau DELIVERED.
Publish OrderShipped, OrderDelivered, OrderCancelled."	"• 4 admin action endpoints
• State machine implemented
• RabbitMQ consumer PaymentSuccess/Failed
• Event publish OrderCompleted/Shipped/Delivered
• State transition unit tests
• Invalid transition → 400 error"
order-service	"Statistics APIs
(admin dashboard)"	"GET /api/admin/statistics/overview
GET /api/admin/statistics/revenue-chart
GET /api/admin/statistics/revenue/last-days/{numberOfDays}
GET /api/admin/statistics/revenue/last-months/{numberOfMonths}
GET /api/admin/statistics/revenue/last-weeks/{numberOfWeeks}
GET /api/admin/statistics/top-products
GET /api/admin/statistics/top-customers
GET /api/admin/statistics/category-revenue
GET /api/admin/statistics/product-performance
GET /api/admin/statistics/recent-orders
GET /api/admin/statistics/filters
POST /api/admin/statistics/invalidate-cache
GET /api/admin/orders/statistics"	REST HTTP (admin)	Gateway	"Dùng aggregate queries trên order_db.
Cache Redis (TTL 10 phút) cho các stats nặng.
Invalidate cache endpoint cho admin force refresh.
Revenue chart: group by day/week/month."	"• 13 statistics endpoints
• Redis cache với TTL
• Invalidate cache endpoint
• Aggregate queries optimize (index)
• Integration test"
order-service	"Internal endpoint
verify purchase
(cho review-service)"	"GET /internal/orders/verify-purchase
  ?userId=&productId="	Internal HTTP (không qua gateway)	review-service (gọi để check verified purchase)	"Query order_db: user đã có order DELIVERED chứa productId.
Return {verified: true/false}.
Chỉ cho phép từ internal network (Docker network), không expose ra gateway."	"• Internal endpoint hoạt động
• Network policy: chỉ internal
• Unit test
• Contract test với review-service"

rest of get cart by id 
{
  "success": true,
  "message": "Success",
  "timestamp": "2026-04-11T21:10:30.7796527Z",
  "data": {
    "id": 1,
    "orderNumber": "string",
    "status": 1,
    "statusName": "string",
    "totalAmount": 1,
    "createdAt": "2026-04-11T21:10:30.7796560Z"
  },
  "errors": {}
}