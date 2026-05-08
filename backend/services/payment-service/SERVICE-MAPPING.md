# Service Mapping - payment-service

## Folder should contain
- API module(s): payment processing, callbacks, gateway status APIs
- persistence: payment_db for transactions, retries, idempotency keys
- integration: external gateways (VNPay, mock), callback signature verification

## API ownership (from OpenAPI)
- POST /api/payment/process
- POST /api/payment/callback
- GET /api/payment/gateways
- GET /api/payment/status/{transactionId}
- GET /api/payment/order/{orderId}/status
- GET /api/payment/vnpay/ipn
- GET /api/v1/payments/vnpay-ipn
- GET /api/v1/payments/vnpay-return
- GET /api/admin/payments
- GET /api/admin/payments/{id}
- GET /api/admin/payments/transaction/{transactionId}
- GET /api/admin/payments/statistics
- GET /api/admin/payments/timeout-statistics
- POST /api/admin/payments/check-timeouts

## Sync calls to other services
- order-service: verify order ownership/state before payment process.
- auth-service: optional user identity introspection if gateway claim is insufficient.

## Async integration
- Consume: OrderCreated (optional pre-created payment intent path).
- Publish: PaymentProcessing, PaymentSuccess, PaymentFailed, PaymentRefunded.