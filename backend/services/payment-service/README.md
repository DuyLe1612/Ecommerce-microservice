# payment-service

Payment gateway service with MoMo and ZaloPay simulator support.

## Tech Stack

- Java 21 + Spring Boot 4.1
- PostgreSQL (Flyway migrations)
- RabbitMQ (event publishing)
- Maven wrapper

## Responsibilities

- Process payments via VNPay, MoMo, ZaloPay, PayPal, Stripe gateways
- Idempotent payment initiation (UUID-based idempotency key)
- Order validation before gateway initiation
- JWT authentication (mock or real via auth-service)
- Domain events published to RabbitMQ

## Run with IntelliJ IDEA (Debug)

This is the recommended approach for local development.

### 1. Start Infrastructure

```bash
cd ../../../infrastructure
docker compose up -d postgres rabbitmq
```

### 2. Open in IntelliJ

1. Open `File → Open` → select `backend/services/payment-service`
2. IntelliJ will detect it as a Maven project — click **Import**
3. Wait for Maven to download dependencies (first time ~2-5 min)

### 3. Add Run Configuration

1. Open **Run → Edit Configurations**
2. Click **+ → Spring Boot**
3. Configure:

| Field | Value |
|---|---|
| Name | `payment-service` |
| Main class | `com.uit.paymentservice.PaymentServiceApplication` |
| Profile | `test` (uses H2 in-memory DB, no Docker needed) |
| VM options | `-Dspring.profiles.active=test` |

For **Docker profile** (uses real PostgreSQL + RabbitMQ):
| Field | Value |
|---|---|
| Profile | `docker` |
| VM options | `-Dspring.profiles.active=docker` |

### 4. Run / Debug

Click **Debug** (or `Shift+F9`) — IntelliJ will:
- Start the Spring Boot app on `http://localhost:8086`
- Attach the debugger on port `5005`
- Stoppoints will pause execution as expected

### 5. Test the API

```bash
# Get gateways (no auth)
curl http://localhost:8086/api/payment/gateways

# Initiate payment (mock auth)
curl -X POST http://localhost:8086/api/payment/process \
  -H "Authorization: Bearer mock-user-1-CUSTOMER" \
  -H "Idempotency-Key: %RANDOM%" \
  -H "Content-Type: application/json" \
  -d '{"orderId":1,"amount":50000,"currency":"VND","gatewayType":"MOMO"}'
```

### Profile Reference

| Profile | Database | RabbitMQ | Auth | Use Case |
|---|---|---|---|---|
| `test` (default) | H2 in-memory | disabled | mock | Unit/integration tests |
| `docker` | PostgreSQL (Docker) | RabbitMQ (Docker) | mock or real | Local debug with real infra |
| *(none)* | PostgreSQL localhost | RabbitMQ localhost | mock | Manual local debug |

## Quick Start

### Prerequisites

- JDK 21+
- Docker & Docker Compose (for full stack)

### Run Locally (with embedded dependencies)

```bash
./mvnw spring-boot:run
```

Service starts on `http://localhost:8086`

### Run with Docker (full stack)

```bash
cd ../../../infrastructure
docker compose up payment-service postgres rabbitmq -d
```

Or run all services:

```bash
cd ../../../infrastructure
docker compose up -d
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8086` | Server port |
| `DB_HOST` | `postgres` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `payment_db` | Database name |
| `DB_USER` | `tekno` | Database user |
| `DB_PASSWORD` | `tekno123` | Database password |
| `JWT_SECRET` | *(required)* | JWT signing secret (min 32 chars) |
| `PAYMENT_EXTERNAL_AUTH_MODE` | `mock` | Auth mode: `mock` or `real` |
| `PAYMENT_EXTERNAL_ORDER_MODE` | `mock` | Order mode: `mock` or `real` |

## API Endpoints

All endpoints require JWT Bearer token unless noted.

### POST /api/payment/process

Initiate a payment. Requires `Idempotency-Key` header.

```json
{
  "orderId": 123,
  "amount": 100000,
  "currency": "VND",
  "gatewayType": "MOMO",
  "returnUrl": "https://example.com/payment/callback",
  "description": "Order #123 payment"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "transactionId": 1,
    "idempotencyKey": "uuid-here",
    "status": "PROCESSING",
    "redirectUrl": "https://...",
    "gatewayType": "MOMO",
    "expiredAt": "2026-06-14T19:30:00"
  }
}
```

### GET /api/payment/gateways

List available gateways (no auth required).

### GET /api/payment/status/{transactionId}

Get payment status.

### GET /api/payment/order/{orderId}/status

Get latest payment for an order.

### POST /api/payment/callback/{gatewayType}

Gateway callback endpoint (no auth required).

## Mock Auth Token

When `PAYMENT_EXTERNAL_AUTH_MODE=mock` (default), use:

```
Authorization: Bearer mock-user-{userId}-{role}
```

Example:
```bash
curl -X POST http://localhost:8086/api/payment/process \
  -H "Authorization: Bearer mock-user-1-CUSTOMER" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 100,
    "amount": 50000,
    "currency": "VND",
    "gatewayType": "MOMO",
    "returnUrl": "https://example.com/callback"
  }'
```

## Architecture

```
Client Request → JwtAuthFilter → AuthServiceClient → ProcessPaymentCommand
                       ↓                           ↓
                   MockAuthServiceClient      OrderServiceClient
                       (mock mode)                  (mock mode)
                                                    ↓
                                              PaymentGatewayFactory
                                                    ↓
                               MoMoSimulator / ZaloPaySimulator / etc.
                                                    ↓
                                            PaymentEventPublisher → RabbitMQ
```

## Gateway Simulators

Each gateway has a simulator that:
- Returns realistic redirect URLs
- Simulates processing delay
- Supports configurable failure rate
- Implements proper HMAC signature verification

Configure failure rates in `application.yaml`:

```yaml
payment:
  simulator:
    momo:
      failure-rate: 0.05      # 5% failure rate
      processing-delay-ms: 150
    zalopay:
      failure-rate: 0.08      # 8% failure rate
      processing-delay-ms: 180
```

## Switching to Real Services

### Auth Service (real mode)

1. Set `PAYMENT_EXTERNAL_AUTH_MODE=real`
2. Ensure `auth-service` is running and exposes `/api/auth/validate`
3. Set `JWT_SECRET` to match auth-service's secret

### Order Service (real mode)

1. Set `PAYMENT_EXTERNAL_ORDER_MODE=real`
2. Ensure `order-service` is running
3. Order service must expose `GET /api/orders/{orderId}/validate?userId={userId}&amount={amount}`

## Database

Migrations run automatically via Flyway. Schema:

```sql
payment_transaction (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'VND',
  gateway_type VARCHAR(30) NOT NULL,
  status VARCHAR(20) NOT NULL,
  idempotency_key VARCHAR(100) NOT NULL UNIQUE,
  gateway_transaction_id VARCHAR(200) UNIQUE,
  ...
)
```

## Running Tests

```bash
./mvnw test
```

Uses H2 in-memory database with Flyway disabled.

## Project Structure

```
src/main/java/com/uit/paymentservice/
├── domain/
│   ├── model/          # PaymentTransaction, Money, enums
│   ├── gateway/        # PaymentGateway interface + DTOs
│   ├── event/          # Domain events
│   └── repository/     # Repository interface
├── application/
│   ├── command/        # ProcessPaymentCommand + Handler
│   ├── query/          # Query handlers
│   ├── dto/            # Response DTOs
│   └── exception/      # Application exceptions
├── infrastructure/
│   ├── gateway/simulator/  # MoMoSimulator, ZaloPaySimulator
│   ├── external/           # AuthServiceClient, OrderServiceClient
│   ├── persistence/        # JPA entity + repository
│   ├── messaging/         # RabbitMQ publisher
│   └── config/             # Configuration beans
├── presentation/
│   ├── rest/          # Controllers
│   ├── dto/           # API request/response wrappers
│   └── config/        # Security, exception handler
└── security/          # JwtAuthFilter, UserContext
```
