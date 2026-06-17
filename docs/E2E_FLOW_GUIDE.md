# E2E Flow Guide: Product → Order → Payment

## Auth Note
auth-service is not yet active. All requests use mock identity:
- **Mock token**: `Authorization: Bearer mock-user-{userId}-{role}`
- **Header shortcut**: `X-User-Id: {userId}` (role defaults to CUSTOMER)
- Admin role example: `Authorization: Bearer mock-user-1-ADMIN`
- Customer role example: `Authorization: Bearer mock-user-42-CUSTOMER` or `X-User-Id: 42`

## Prerequisites

### 1. Start infrastructure
```bash
# For order-service and payment-service (standard ports)
cd infrastructure
docker-compose -f docker-compose.local.yml up -d

# For product-service (separate ports to avoid conflicts)
cd backend/services/product-service
docker-compose up -d product-db redis rabbitmq
```

### 2. Start services (each in a separate terminal)
```bash
# Terminal 1 — product-service
cd backend/services/product-service
mvn spring-boot:run

# Terminal 2 — order-service
cd backend/services/order-service
./mvnw spring-boot:run

# Terminal 3 — payment-service
cd backend/services/payment-service
./mvnw spring-boot:run
```

### 3. Verify services are up
```bash
curl http://localhost:8080/actuator/health  # product-service
curl http://localhost:8087/actuator/health  # order-service
curl http://localhost:8086/actuator/health  # payment-service
```

---

## Step 1 — Create Category
```bash
curl -s -X POST http://localhost:8080/api/admin/categories \
  -H "Authorization: Bearer mock-user-1-ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Smartphones","slug":"smartphones"}' | jq .
# Save: id (e.g. 1)
```

## Step 2 — Create Brand
```bash
curl -s -X POST http://localhost:8080/api/admin/brands/create \
  -H "Authorization: Bearer mock-user-1-ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Apple","slug":"apple"}' | jq .
# Save: id (e.g. 1)
```

## Step 3 — Create Product
```bash
curl -s -X POST http://localhost:8080/api/admin/products \
  -H "Authorization: Bearer mock-user-1-ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "slug": "iphone-15-pro",
    "categoryId": 1,
    "brandId": 1,
    "basePrice": 29990000,
    "status": "AVAILABLE",
    "description": "Latest iPhone"
  }' | jq .
# Save: id (e.g. 1)
```

## Step 4 — Add Variant with Stock
```bash
curl -s -X POST http://localhost:8080/api/admin/products/variants \
  -H "Authorization: Bearer mock-user-1-ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "sku": "IP15PRO-128-BLACK",
    "price": 29990000,
    "stock": 50,
    "status": "available"
  }' | jq .
# Save: id (variantId, e.g. 1)
```

## Step 5 — Confirm Stock (optional sanity check)
```bash
curl -s http://localhost:8080/internal/products/stock/1 | jq .
# availableStock should be 50
```

## Step 6 — Create Order
Replace `variantId` with the id from Step 4.
```bash
curl -s -X POST http://localhost:8087/api/orders/create \
  -H "X-User-Id: 42" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 42,
    "items": [{
      "productId": 1,
      "productName": "iPhone 15 Pro 128GB Black",
      "quantity": 1,
      "unitPrice": 29990000,
      "subtotal": 29990000
    }],
    "subtotal": 29990000,
    "discountAmount": 0,
    "shippingFee": 30000,
    "currency": "VND",
    "shippingAddress": {
      "recipientName": "Nguyen Van A",
      "phone": "0901234567",
      "streetAddress": "123 Nguyen Trai",
      "city": "Ho Chi Minh",
      "district": "Quan 1",
      "ward": "Phuong Ben Nghe",
      "postalCode": "70000"
    },
    "notes": "Please call before delivery"
  }' | jq .
# Save: id (orderId), orderNumber, status should be PENDING_PAYMENT
```

## Step 7 — Verify Stock Reserved
```bash
curl -s http://localhost:8080/internal/products/stock/1 | jq .
# availableStock should now be 49 (50 - 1 reserved)
```

## Step 8 — Initiate Payment
Replace `orderId` and `amount` (must equal subtotal + shippingFee = 30020000).
Generate a UUID for idempotency key.
```bash
IDEMPOTENCY_KEY=$(uuidgen)   # or: python3 -c "import uuid; print(uuid.uuid4())"

curl -s -X POST http://localhost:8086/api/payment/process \
  -H "X-User-Id: 42" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "amount": 30020000,
    "currency": "VND",
    "gatewayType": "MOMO",
    "returnUrl": "http://localhost:3000/payment/callback",
    "description": "Payment for order"
  }' | jq .
# Save: transactionId, status should be PROCESSING, redirectUrl is the mock gateway URL
echo "Idempotency key used: $IDEMPOTENCY_KEY"
```

## Step 9 — Simulate Payment Success
```bash
curl -s -X POST \
  "http://localhost:8086/internal/callback/success?idempotencyKey=$IDEMPOTENCY_KEY&gatewayType=MOMO" \
  | jq .
# status should be SUCCESS
```

## Step 10 — Verify Payment Status
```bash
curl -s http://localhost:8086/api/payment/status/1 | jq .
# status: SUCCESS
```

## Step 11 — Verify Order Transitioned (via RabbitMQ event)
Wait ~2 seconds for the RabbitMQ event to flow from payment-service to order-service.
```bash
curl -s http://localhost:8087/api/orders/by-id/1 | jq .
# status should be PROCESSING (PENDING_PAYMENT → PAID → PROCESSING)
```

## Step 12 — Admin Ships Order
```bash
curl -s -X POST \
  "http://localhost:8087/api/admin/orders/1/ship?trackingNumber=VN123456789" \
  -H "Authorization: Bearer mock-user-1-ADMIN" \
  | jq .
# status: SHIPPING
```

## Step 13 — Admin Delivers Order
```bash
curl -s -X POST \
  "http://localhost:8087/api/admin/orders/1/deliver" \
  -H "Authorization: Bearer mock-user-1-ADMIN" \
  | jq .
# status: DELIVERED
# OrderCompleted event published → coupon-service will record any coupon usage
```

---

## Verification Checklist
- [ ] product-service: product and variant visible via `GET /api/products/iphone-15-pro`
- [ ] product-service: stock = 50 before order, 49 after order (1 reserved)
- [ ] order-service: order in `PENDING_PAYMENT` after creation
- [ ] payment-service: transaction in `PROCESSING` after initiation
- [ ] payment-service: transaction in `SUCCESS` after callback
- [ ] order-service: order in `PROCESSING` after payment event (check RabbitMQ management UI)
- [ ] order-service: order in `SHIPPING` after admin ships
- [ ] order-service: order in `DELIVERED` after admin delivers
- [ ] RabbitMQ management UI (`http://localhost:15672`, user: tekno / tekno123): queues have 0 unacked messages

## Swagger UIs
- product-service: `http://localhost:8080/swagger-ui.html` (if enabled)
- order-service: `http://localhost:8087/swagger-ui/index.html`
- payment-service: `http://localhost:8086/swagger-ui/index.html`
