# Microservices

Pet Rescue E-commerce platform — microservice architecture.

## Architecture Overview

```
Client
  │
  ▼
┌─────────────────────┐
│   API Gateway        │  :8080  (nginx)
│   (nginx reverse     │
│    proxy + auth)     │
└────────┬────────────┘
         │
         ├── auth-service          :8081  (NestJS)
         ├── product-service       :8082  (Java/Spring)
         ├── search-service        :8083  (Java/Spring)
         ├── promotion-service     :8084  (Java/Spring)
         ├── coupon-service        :8085  (Java/Spring)
         ├── payment-service       :8086  (Java/Spring)  ← implemented
         ├── order-service         :8087  (Java/Spring)
         ├── cart-service          :8088  (Java/Spring)
         ├── review-service        :8089  (Java/Spring)
         └── notification-service  :8090  (Java/Spring)

         ┌─────────────────────────┐
         │  Infrastructure         │
         │  - PostgreSQL :5432     │
         │  - Redis     :6379      │
         │  - RabbitMQ  :5672      │
         │  - RabbitMQ  :15672     │
         │    (management UI)      │
         └─────────────────────────┘
```

## Services

| Service | Port | Tech | Status |
|---|---|---|---|
| [payment-service](backend/services/payment-service) | 8086 | Java 21 / Spring Boot 4.1 | Fully implemented |
| [auth-service](backend/services/auth-service) | 8081 | NestJS / TypeScript | Implemented |
| [product-service](backend/services/product-service) | 8082 | Java / Spring | Implemented |
| order-service | 8087 | Java / Spring | Scaffold |
| cart-service | 8088 | Java / Spring | Scaffold |
| review-service | 8089 | Java / Spring | Scaffold |
| notification-service | 8090 | Java / Spring | Scaffold |
| coupon-service | 8085 | Java / Spring | Implemented |
| promotion-service | 8084 | Java / Spring | Implemented |
| search-service | 8083 | Java / Spring | Implemented |

## Local Development with IntelliJ IDEA

### Payment Service (Java/Spring Boot)

```bash
# 1. Start infrastructure only
cd infrastructure
docker compose up -d postgres redis rabbitmq

# 2. Open in IntelliJ
#    File → Open → select backend/services/payment-service
#    IntelliJ auto-detects Maven → Import

# 3. Add Run Configuration
#    Run → Edit Configurations → + → Spring Boot
#    Name: payment-service
#    Main class: com.uit.paymentservice.PaymentServiceApplication
#    Profile: docker
#    VM options: -Dspring.profiles.active=docker

# 4. Debug (Shift+F9)
#    - App runs on http://localhost:8086
#    - Breakpoints in IntelliJ work normally
```

### Other Java Services

Same pattern — open the service directory, set profile to `docker` or `test`, and run.

## Prerequisites

- **Docker** 20.10+ and **Docker Compose** v2
- **JDK 21+** (for running individual Java services locally)
- **Node.js 18+** (for running auth-service locally)
- **Maven** (or use included `mvnw` wrapper)

## Quick Start

### Run All Services (Docker)

```bash
cd infrastructure
docker compose up -d
```

Access:
- Gateway: `http://localhost:8080`
- RabbitMQ Management: `http://localhost:15672` (user: `tekno`, pass: `tekno123`)

### Run All Services (Local)

```bash
# 1. Start infrastructure
cd infrastructure
docker compose up -d postgres redis rabbitmq

# 2. Start each service in its own terminal
cd backend/services/auth-service    && npm start       # :8081
cd backend/services/product-service && ./mvnw spring-boot:run  # :8082
cd backend/services/payment-service && ./mvnw spring-boot:run  # :8086
# ... (repeat for other services)
```

## Running Partial Services

### Option A — IntelliJ + Docker Infra (Recommended for development)

```bash
# 1. Start only infrastructure
cd infrastructure
docker compose up -d postgres redis rabbitmq

# 2. Open payment-service in IntelliJ
#    File → Open → select backend/services/payment-service
#    Run → Edit Configurations → + → Spring Boot
#      Main class: com.uit.paymentservice.PaymentServiceApplication
#      Profile: docker
#      VM options: -Dspring.profiles.active=docker
# 3. Click Debug (Shift+F9) — app starts on :8086 with real PostgreSQL + RabbitMQ
```

### Option B — Docker Compose (payment-service containerized)

```bash
cd infrastructure
docker compose up -d postgres redis rabbitmq
docker compose up -d --build payment-service
```

> **Note:** If the Docker build fails with "Goal requires a project to execute",
> the `.dockerignore` was missing. Rebuild with `--no-cache`:
> ```bash
> docker compose up -d --build --no-cache payment-service
> ```

### Payment + Auth Service

```bash
cd infrastructure
docker compose up -d postgres redis rabbitmq auth-service payment-service
```

### Any Single Service

```bash
cd infrastructure
docker compose up -d postgres redis rabbitmq <service-name>
```

Available: `auth-service`, `product-service`, `search-service`, `promotion-service`, `coupon-service`, `payment-service`, `order-service`, `cart-service`, `review-service`, `notification-service`

### Run Payment Service Locally (no Docker, H2 in-memory)

```bash
cd backend/services/payment-service
./mvnw spring-boot:run -Dspring.profiles.active=test
```

### Run Payment Service in Docker (standalone, outside compose)

```bash
# First ensure infra is up
cd infrastructure
docker compose up -d postgres redis rabbitmq

# Build and run (env vars are baked into application-docker.yml)
cd backend/services/payment-service
docker build -t payment-service .
docker run -p 8086:8086 \
  -e SPRING_PROFILES_ACTIVE=docker \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/payment_db \
  -e SPRING_RABBITMQ_HOST=host.docker.internal \
  -e JWT_SECRET=your-256-bit-secret-key-for-jwt-signing-minimum-32-chars \
  --network ecommerce-microservices_ecommerce-net \
  payment-service
```

> **Windows/macOS:** replace `host.docker.internal` with the IP of your Docker host,
> or ensure Docker Desktop has "Expose daemon on tcp://localhost:2375" enabled.

## Environment Configuration

Each service has a `.env.example` file. Copy to `.env` and configure:

```bash
cp .env.example .env
```

Key shared variables:
```bash
# Infrastructure (all services)
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=tekno
POSTGRES_PASSWORD=tekno123

REDIS_HOST=redis
REDIS_PORT=6379

RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_URL=amqp://tekno:tekno123@rabbitmq:5672

# Payment service specific
JWT_SECRET=your-256-bit-secret-key-for-jwt-signing-minimum-32-chars
PAYMENT_EXTERNAL_AUTH_MODE=mock   # mock | real
PAYMENT_EXTERNAL_ORDER_MODE=mock  # mock | real
```

## Testing the Payment Service

### With Mock Auth (default)

```bash
# Get available gateways (no auth)
curl http://localhost:8086/api/payment/gateways

# Initiate payment (mock auth)
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

# Check status
curl http://localhost:8086/api/payment/status/1 \
  -H "Authorization: Bearer mock-user-1-CUSTOMER"
```

### With Real Auth Service

1. Start auth-service: `cd backend/services/auth-service && npm start`
2. Generate a real JWT from auth-service
3. Set `PAYMENT_EXTERNAL_AUTH_MODE=real` and `JWT_SECRET` to match

## API Documentation

Service-specific docs:
- [payment-service](backend/services/payment-service/README.md)
- [auth-service](backend/services/auth-service/README.md)
- [product-service](backend/services/product-service/README.md)

Architecture & design docs:
- [Architecture](document/microservices/architecture.md)
- [API Docs](document/microservices/api-docs.md)
- [Coding Rules](document/microservices/coding-rules.md)
- [Implementation Plan](document/microservices/implementation-plan.md)

## Troubleshooting

### Port already in use

```bash
# Find what's using port 8086
netstat -ano | findstr :8086
# or
lsof -i :8086

# Kill it
taskkill /PID <pid> /F   # Windows
kill -9 <pid>             # macOS/Linux
```

### PostgreSQL connection refused

```bash
# Ensure postgres container is running
docker compose ps postgres

# Check logs
docker compose logs postgres

# Reset database
docker compose down -v   # WARNING: destroys data
docker compose up -d
```

### RabbitMQ connection refused

```bash
# Check RabbitMQ is running
docker compose ps rabbitmq

# Access management UI at http://localhost:15672
# Default: tekno / tekno123
```

### Docker build fails (payment-service)

```bash
cd backend/services/payment-service
./mvnw clean package -DskipTests
# Then retry docker build
```

### Tests fail

```bash
cd backend/services/payment-service
# Tests use H2 in-memory DB + disabled RabbitMQ
./mvnw test -Dspring.profiles.active=test
```

## Common Tasks

### Restart a single service

```bash
cd infrastructure
docker compose restart payment-service
```

### View logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f payment-service

# Last 100 lines
docker compose logs --tail=100 payment-service
```

### Rebuild after code changes

```bash
cd infrastructure
docker compose up -d --build payment-service
```

### Stop everything

```bash
cd infrastructure
docker compose down
```

### Stop and remove volumes (full reset)

```bash
cd infrastructure
docker compose down -v
```

## Service Ports Reference

| Service | Local Port | Docker Port | Path |
|---|---|---|---|
| Gateway | 8080 | 80 | `gateway/` |
| auth-service | 8081 | 8081 | `backend/services/auth-service/` |
| product-service | 8082 | 8082 | `backend/services/product-service/` |
| search-service | 8083 | 8083 | `backend/services/search-service/` |
| promotion-service | 8084 | 8084 | `backend/services/promotion-service/` |
| coupon-service | 8085 | 8085 | `backend/services/coupon-service/` |
| payment-service | 8086 | 8086 | `backend/services/payment-service/` |
| order-service | 8087 | 8087 | `backend/services/order-service/` |
| cart-service | 8088 | 8088 | `backend/services/cart-service/` |
| review-service | 8089 | 8089 | `backend/services/review-service/` |
| notification-service | 8090 | 8090 | `backend/services/notification-service/` |
| PostgreSQL | 5432 | 5432 | infrastructure |
| Redis | 6379 | 6379 | infrastructure |
| RabbitMQ | 5672 | 5672 | infrastructure |
| RabbitMQ UI | 15672 | 15672 | infrastructure |
