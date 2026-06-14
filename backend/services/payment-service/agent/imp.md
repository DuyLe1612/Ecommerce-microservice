# PAYMENT SERVICE — AGENT EXECUTION PLAN

> **IMPORTANT FOR AGENT**: This is a **fully simulated / mock payment service**.
> ALL 5 payment gateways are **simulators** — no real money, no real API keys, no external HTTP calls to gateway providers.
> Each gateway simulator has its own distinct implementation style to demonstrate the Factory Method pattern.
> The goal is a working Spring Boot service with realistic flows, not real payment processing.

---

## AGENT INSTRUCTIONS

Read this file top-to-bottom before writing any code.
Execute tasks in order. Do not skip phases.
After each phase, verify the build passes (`./mvnw test`) before moving on.
Mark tasks complete by replacing `[ ]` with `[x]` as you finish them.

---

## TECH STACK

```
Java 21
Spring Boot 3.2.x
PostgreSQL 15 (database: payment_db)
RabbitMQ 3.x (exchange: payment.events)
Maven
Flyway (DB migrations)
JUnit 5 + Mockito (tests)
```

---

## PROJECT LAYOUT (create exactly this structure)

```
payment-service/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/com/example/payment/
│   │   │   ├── PaymentServiceApplication.java
│   │   │   │
│   │   │   ├── domain/
│   │   │   │   ├── model/
│   │   │   │   │   ├── PaymentTransaction.java          ← aggregate root
│   │   │   │   │   ├── PaymentStatus.java               ← enum
│   │   │   │   │   ├── PaymentGatewayType.java          ← enum
│   │   │   │   │   ├── Money.java                       ← value object
│   │   │   │   │   └── IdempotencyKey.java              ← value object
│   │   │   │   ├── event/
│   │   │   │   │   ├── PaymentEvent.java                ← sealed base
│   │   │   │   │   ├── PaymentInitiatedEvent.java
│   │   │   │   │   ├── PaymentSucceededEvent.java
│   │   │   │   │   ├── PaymentFailedEvent.java
│   │   │   │   │   ├── PaymentRefundedEvent.java
│   │   │   │   │   └── PaymentTimedOutEvent.java
│   │   │   │   ├── gateway/
│   │   │   │   │   ├── PaymentGateway.java              ← interface (Factory target)
│   │   │   │   │   ├── GatewayPaymentRequest.java
│   │   │   │   │   ├── GatewayPaymentResult.java
│   │   │   │   │   ├── GatewayCallbackResult.java
│   │   │   │   │   ├── GatewayStatusResult.java
│   │   │   │   │   └── GatewayRefundResult.java
│   │   │   │   └── repository/
│   │   │   │       └── PaymentRepository.java           ← domain interface
│   │   │   │
│   │   │   ├── application/
│   │   │   │   ├── command/
│   │   │   │   │   ├── ProcessPaymentCommand.java
│   │   │   │   │   ├── HandleCallbackCommand.java
│   │   │   │   │   ├── RefundPaymentCommand.java
│   │   │   │   │   └── CheckPaymentTimeoutsCommand.java
│   │   │   │   ├── query/
│   │   │   │   │   ├── GetPaymentStatusQuery.java
│   │   │   │   │   ├── GetOrderPaymentStatusQuery.java
│   │   │   │   │   ├── GetAvailableGatewaysQuery.java
│   │   │   │   │   ├── AdminListPaymentsQuery.java
│   │   │   │   │   └── AdminPaymentStatisticsQuery.java
│   │   │   │   └── dto/
│   │   │   │       ├── ProcessPaymentRequest.java
│   │   │   │       ├── ProcessPaymentResponse.java
│   │   │   │       ├── PaymentStatusResponse.java
│   │   │   │       ├── RefundRequest.java
│   │   │   │       └── ApiResponse.java
│   │   │   │
│   │   │   ├── infrastructure/
│   │   │   │   ├── gateway/
│   │   │   │   │   ├── PaymentGatewayFactory.java       ← Factory Method
│   │   │   │   │   ├── SimulatorConfig.java
│   │   │   │   │   └── simulator/
│   │   │   │   │       ├── VNPaySimulator.java          ← mock impl #1
│   │   │   │   │       ├── MoMoSimulator.java           ← mock impl #2
│   │   │   │   │       ├── ZaloPaySimulator.java        ← mock impl #3
│   │   │   │   │       ├── PayPalSimulator.java         ← mock impl #4
│   │   │   │   │       └── StripeSimulator.java         ← mock impl #5
│   │   │   │   ├── external/
│   │   │   │   │   ├── AuthServiceClient.java           ← interface
│   │   │   │   │   ├── MockAuthServiceClient.java       ← mock impl (mode=mock)
│   │   │   │   │   ├── RealAuthServiceClient.java       ← real impl (mode=real)
│   │   │   │   │   ├── OrderServiceClient.java          ← interface
│   │   │   │   │   ├── MockOrderServiceClient.java      ← mock impl (mode=mock)
│   │   │   │   │   ├── RealOrderServiceClient.java      ← real impl (mode=real)
│   │   │   │   │   └── ExternalServiceConfig.java       ← @ConfigurationProperties
│   │   │   │   ├── persistence/
│   │   │   │   │   ├── entity/
│   │   │   │   │   │   └── PaymentTransactionJpaEntity.java
│   │   │   │   │   ├── repository/
│   │   │   │   │   │   └── PaymentJpaRepository.java
│   │   │   │   │   └── PaymentRepositoryImpl.java
│   │   │   │   └── messaging/
│   │   │   │       ├── PaymentEventPublisher.java
│   │   │   │       └── RabbitMQConfig.java
│   │   │   │
│   │   │   └── presentation/
│   │   │       ├── rest/
│   │   │       │   ├── PaymentController.java           ← public endpoints
│   │   │       │   ├── PaymentCallbackController.java   ← IPN / webhook
│   │   │       │   └── AdminPaymentController.java      ← admin endpoints
│   │   │       └── config/
│   │   │           ├── SecurityConfig.java
│   │   │           └── GlobalExceptionHandler.java
│   │   │
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-test.yml
│   │       └── db/migration/
│   │           ├── V1__create_payment_transaction.sql
│   │           └── V2__create_indexes.sql
│   │
│   └── test/
│       └── java/com/example/payment/
│           ├── gateway/
│           │   ├── VNPaySimulatorTest.java
│           │   ├── MoMoSimulatorTest.java
│           │   ├── ZaloPaySimulatorTest.java
│           │   ├── PayPalSimulatorTest.java
│           │   └── StripeSimulatorTest.java
│           ├── command/
│           │   └── ProcessPaymentCommandTest.java
│           └── integration/
│               └── PaymentFlowIntegrationTest.java
```

---

## PHASE 1 — PROJECT BOOTSTRAP

### Tasks

- [ ] **1.1** Create `pom.xml` with the following dependencies:

```xml
<dependencies>
  <!-- Core -->
  <dependency>spring-boot-starter-web</dependency>
  <dependency>spring-boot-starter-data-jpa</dependency>
  <dependency>spring-boot-starter-security</dependency>
  <dependency>spring-boot-starter-amqp</dependency>
  <dependency>spring-boot-starter-actuator</dependency>
  <dependency>spring-boot-starter-validation</dependency>

  <!-- Database -->
  <dependency>postgresql (runtime)</dependency>
  <dependency>flyway-core</dependency>
  <dependency>h2 (test scope)</dependency>

  <!-- Utilities -->
  <dependency>lombok</dependency>
  <dependency>jackson-databind</dependency>

  <!-- External Service HTTP Client (WebClient for real service calls) -->
  <dependency>spring-boot-starter-webflux</dependency>

  <!-- JWT parsing (for real mode auth validation) -->
  <dependency>io.jsonwebtoken:jjwt-api:0.12.5</dependency>
  <dependency>io.jsonwebtoken:jjwt-impl:0.12.5 (runtime)</dependency>
  <dependency>io.jsonwebtoken:jjwt-jackson:0.12.5 (runtime)</dependency>

  <!-- Test -->
  <dependency>spring-boot-starter-test</dependency>
  <dependency>spring-rabbit-test</dependency>
</dependencies>

Java version: 21
Spring Boot version: 3.2.5
```

- [ ] **1.2** Create `PaymentServiceApplication.java` — standard `@SpringBootApplication` entry point with `@EnableScheduling`

- [ ] **1.3** Create `application.yml`:

```yaml
server:
  port: 8086

spring:
  application:
    name: payment-service
  datasource:
    url: jdbc:postgresql://localhost:5432/payment_db
    username: postgres
    password: postgres
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
  flyway:
    enabled: true
    locations: classpath:db/migration
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest

payment:
  external:
    auth:
      mode: mock    # 'mock' for dev/test, 'real' for production
      base-url: http://auth-service:8081
      jwt-secret: ${JWT_SECRET:your-256-bit-secret-key-for-jwt-signing-minimum-32-chars}
    order:
      mode: mock    # 'mock' for dev/test, 'real' for production
      base-url: http://order-service:8082
  simulator:
    # Controls random failure rate for each mock gateway (0.0 = never fail, 1.0 = always fail)
    vnpay:
      failure-rate: 0.1       # 10% chance of simulated failure
      processing-delay-ms: 200
    momo:
      failure-rate: 0.05
      processing-delay-ms: 150
    zalopay:
      failure-rate: 0.08
      processing-delay-ms: 180
    paypal:
      failure-rate: 0.03
      processing-delay-ms: 300
    stripe:
      failure-rate: 0.02
      processing-delay-ms: 100
  timeout:
    default-minutes: 15
    sweep-interval-ms: 60000

logging:
  level:
    com.example.payment: DEBUG
  pattern:
    level: "service=payment-service %5p"
```

- [ ] **1.4** Create `application-test.yml` (overrides for tests):

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1
    driver-class-name: org.h2.Driver
  jpa:
    database-platform: org.hibernate.dialect.H2Dialect
  flyway:
    locations: classpath:db/migration
  rabbitmq:
    # Use embedded mock — RabbitMQ not required for unit/integration tests

payment:
  external:
    auth:
      mode: mock
    order:
      mode: mock
  simulator:
    vnpay:
      failure-rate: 0.0     # deterministic in tests
      processing-delay-ms: 0
    momo:
      failure-rate: 0.0
      processing-delay-ms: 0
    zalopay:
      failure-rate: 0.0
      processing-delay-ms: 0
    paypal:
      failure-rate: 0.0
      processing-delay-ms: 0
    stripe:
      failure-rate: 0.0
      processing-delay-ms: 0
```

---

## PHASE 2 — DOMAIN MODEL

### Tasks

- [ ] **2.1** Create `PaymentGatewayType.java` enum:

```java
public enum PaymentGatewayType {
    VNPAY,
    MOMO,
    ZALOPAY,
    PAYPAL,
    STRIPE
}
```

- [ ] **2.2** Create `PaymentStatus.java` enum:

```java
public enum PaymentStatus {
    PENDING,      // created, not yet sent to gateway
    PROCESSING,   // redirect URL generated, waiting for user/callback
    SUCCESS,      // gateway confirmed payment
    FAILED,       // gateway reported failure
    TIMEOUT,      // expiredAt passed, no callback received
    REFUNDED      // refund completed
}
```

**Valid transitions** (enforce in aggregate):
```
PENDING     → PROCESSING
PROCESSING  → SUCCESS
PROCESSING  → FAILED
PROCESSING  → TIMEOUT
SUCCESS     → REFUNDED
FAILED      → PENDING  (retry, max 3 times)
```

- [ ] **2.3** Create `Money.java` value object:

```java
// Immutable. amount must be > 0. currency must be non-blank.
// Provide: add(Money), equals, hashCode, toString
// Example toString: "250000 VND"
public record Money(BigDecimal amount, String currency) {
    public Money {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0)
            throw new IllegalArgumentException("Amount must be positive");
        if (currency == null || currency.isBlank())
            throw new IllegalArgumentException("Currency required");
    }
}
```

- [ ] **2.4** Create `IdempotencyKey.java` value object:

```java
// Wraps a UUID string. Validates UUID format on construction.
public record IdempotencyKey(String value) {
    public IdempotencyKey {
        if (value == null || value.isBlank())
            throw new IllegalArgumentException("Idempotency key required");
        // validate UUID format
    }
}
```

- [ ] **2.5** Create `PaymentTransaction.java` — AGGREGATE ROOT:

```java
// Fields:
//   Long id
//   Long orderId
//   Long userId
//   Money amount
//   PaymentGatewayType gatewayType
//   PaymentStatus status
//   IdempotencyKey idempotencyKey
//   String gatewayTransactionId   (set by gateway after initiation)
//   String simulatedRedirectUrl   (fake URL generated by simulator)
//   String gatewayRawResponse     (JSON string logged for audit)
//   String failureReason
//   int retryCount
//   LocalDateTime createdAt
//   LocalDateTime updatedAt
//   LocalDateTime expiredAt

// Behavior methods (all validate transition before applying):
//   static PaymentTransaction create(...)
//   void markProcessing(String simulatedRedirectUrl)
//   void markSuccess(String gatewayTxId, String rawResponse)
//   void markFailed(String reason)
//   void markTimedOut()
//   void markRefunded()
//   boolean canRetry()          → retryCount < 3 && status == FAILED
//   void incrementRetry()

// Throw IllegalStateException on invalid transition with message:
// "Cannot transition from {current} to {target}"
```

- [ ] **2.6** Create all 6 domain event classes under `domain/event/`:

```java
// Base sealed class
public abstract sealed class PaymentEvent
    permits PaymentInitiatedEvent, PaymentSucceededEvent,
            PaymentFailedEvent, PaymentRefundedEvent, PaymentTimedOutEvent {
    public final String transactionId;
    public final Long orderId;
    public final Long userId;
    public final LocalDateTime occurredAt;
}

// Each subclass adds gateway-specific fields:
// PaymentInitiatedEvent   → gatewayType, amount, currency
// PaymentSucceededEvent   → gatewayType, amount, currency, gatewayTransactionId
// PaymentFailedEvent      → gatewayType, reason
// PaymentRefundedEvent    → gatewayType, amount, currency
// PaymentTimedOutEvent    → gatewayType
```

- [ ] **2.7** Create `PaymentGateway.java` interface:

```java
public interface PaymentGateway {

    PaymentGatewayType getType();

    /**
     * Initiate a payment. Returns a simulated redirect URL and gateway transaction ID.
     * In a real implementation this would call the external gateway API.
     * Here it generates fake data deterministically based on the request.
     */
    GatewayPaymentResult initiate(GatewayPaymentRequest request);

    /**
     * Process a callback/IPN/webhook from the gateway.
     * Params map contains gateway-specific fields (different per implementation).
     */
    GatewayCallbackResult processCallback(Map<String, String> params);

    /**
     * Query current payment status from the gateway.
     * Simulator returns status based on stored state.
     */
    GatewayStatusResult queryStatus(String gatewayTransactionId);

    /**
     * Process a refund.
     * Simulator validates amount <= original and returns success.
     */
    GatewayRefundResult refund(String gatewayTransactionId, Money amount);

    /**
     * Verify the signature/MAC on a callback payload.
     * Each simulator uses a different algorithm to show variation.
     */
    boolean verifySignature(Map<String, String> params);
}
```

- [ ] **2.8** Create all 4 Gateway DTO records:

```java
// GatewayPaymentRequest: transactionId, orderId, userId, amount, currency,
//                         returnUrl, description, metadata Map<String,String>

// GatewayPaymentResult:  gatewayTransactionId, redirectUrl, rawResponse,
//                         success, errorMessage

// GatewayCallbackResult: success, gatewayTransactionId, status, rawParams,
//                         verifiedSignature

// GatewayStatusResult:   gatewayTransactionId, status, rawResponse, success

// GatewayRefundResult:   refundId, success, refundedAmount, errorMessage
```

- [ ] **2.9** Create `PaymentRepository.java` domain interface:

```java
public interface PaymentRepository {
    PaymentTransaction save(PaymentTransaction tx);
    Optional<PaymentTransaction> findById(Long id);
    Optional<PaymentTransaction> findByIdempotencyKey(String key);
    Optional<PaymentTransaction> findByGatewayTransactionId(String gatewayTxId);
    Optional<PaymentTransaction> findLatestByOrderId(Long orderId);
    List<PaymentTransaction> findByOrderId(Long orderId);
    List<PaymentTransaction> findProcessingExpiredBefore(LocalDateTime cutoff);
    Page<PaymentTransaction> findAll(PaymentFilter filter, Pageable pageable);
    PaymentStatistics getStatistics(LocalDate from, LocalDate to);
}
```

---

## PHASE 3 — 5 MOCK GATEWAY SIMULATORS

> **AGENT NOTE**: These are the core of the mock service.
> Each simulator MUST have a distinct implementation style — do NOT make them all identical.
> No real HTTP calls. No real credentials. All data is generated internally.
> Each simulator has configurable failure-rate and processing-delay from `application.yml`.

### 3.1 SimulatorConfig.java

- [ ] Create `@ConfigurationProperties(prefix = "payment.simulator")` class binding the YAML config.
  Each gateway has `failureRate: double` and `processingDelayMs: long`.

### 3.2 VNPaySimulator.java — STYLE: Redirect-based with HMAC-SHA512 signature simulation

```
Implementation notes:
- getType() → VNPAY
- initiate():
    * Sleep processingDelayMs (Thread.sleep)
    * Generate gatewayTransactionId = "VNP" + System.currentTimeMillis()
    * Build a fake redirect URL:
      "https://sandbox.vnpayment.vn/simulate?vnp_TxnRef={transactionId}&vnp_Amount={amount*100}&vnp_OrderInfo={orderId}"
    * Generate vnp_SecureHash using HMAC-SHA512 over sorted query params with a hardcoded mock secret "VNPAY_MOCK_SECRET_KEY_FOR_SIMULATION"
    * Apply failure-rate: Random.nextDouble() < failureRate → return failed result
    * rawResponse = JSON with all vnp_ fields

- processCallback(params):
    * Expect params: vnp_TxnRef, vnp_Amount, vnp_ResponseCode, vnp_SecureHash
    * verifySignature first
    * vnp_ResponseCode == "00" → SUCCESS, else FAILED
    * Return GatewayCallbackResult

- verifySignature(params):
    * Sort params alphabetically (exclude vnp_SecureHash)
    * Concat as "key=val&key=val"
    * HMAC-SHA512 with mock secret
    * Compare to params.get("vnp_SecureHash")

- queryStatus(gatewayTransactionId):
    * Return a GatewayStatusResult with status=SUCCESS and mock data

- refund(gatewayTransactionId, amount):
    * Generate refundId = "VNPREF" + UUID.randomUUID().toString().substring(0,8).toUpperCase()
    * Always succeed if amount > 0
```

### 3.3 MoMoSimulator.java — STYLE: QR code / deep-link with HMAC-SHA256

```
Implementation notes:
- getType() → MOMO
- initiate():
    * Sleep processingDelayMs
    * Generate gatewayTransactionId = "MOMO" + UUID.randomUUID().toString().replace("-","").substring(0,16).toUpperCase()
    * Build fake QR content: "momo://payment?partnerCode=MOCK_PARTNER&requestId={transactionId}&amount={amount}"
    * Wrap in fake URL: "https://test-payment.momo.vn/simulate/qr?data={base64(qrContent)}"
    * Build HMAC-SHA256 signature over:
      "accessKey={accessKey}&amount={amount}&extraData=&ipnUrl=...&orderId={transactionId}&orderInfo={orderId}&partnerCode=MOCK&redirectUrl=...&requestId={transactionId}&requestType=captureWallet"
      using mock secret "MOMO_MOCK_SECRET_KEY_FOR_SIMULATION"
    * Apply failure-rate
    * rawResponse = JSON: { partnerCode, requestId, orderId, amount, responseTime, resultCode, message, payUrl, deeplink, qrCodeUrl }

- processCallback(params):
    * Expect params: partnerCode, orderId, requestId, amount, orderInfo, resultCode, message, signature
    * verifySignature first
    * resultCode == "0" → SUCCESS, else FAILED
    * Return GatewayCallbackResult

- verifySignature(params):
    * Build raw string from specific MoMo fields in fixed order
    * HMAC-SHA256 with mock secret
    * Compare to params.get("signature")

- queryStatus() / refund() → similar pattern, return mock success
```

### 3.4 ZaloPaySimulator.java — STYLE: Order-based with MAC verification (different field set)

```
Implementation notes:
- getType() → ZALOPAY
- initiate():
    * Sleep processingDelayMs
    * Generate apptransid = LocalDate.now().format("yyMMdd") + "_" + transactionId
    * gatewayTransactionId = "ZLP" + apptransid
    * Build order token: Base64(JSON{appid, apptransid, appuser, amount, apptime, embeddata, item})
    * Build mac: HMAC-SHA256("appid|apptransid|appuser|amount|apptime|embeddata|item", "ZALOPAY_MOCK_KEY1")
    * Redirect URL: "https://sandbox.zalopay.vn/simulate?token={orderToken}&appid=MOCK_APP_ID"
    * rawResponse = JSON: { return_code, return_message, sub_return_code, sub_return_message, zp_trans_token, order_url }

- processCallback(params):
    * Expect params: data (JSON string), mac
    * Parse data JSON to extract apptransid, zptransid, amount, server_time, channel, merchant_user_id
    * verifySignature: HMAC-SHA256(data, key2="ZALOPAY_MOCK_KEY2") == mac
    * type == 1 → SUCCESS, else FAILED

- verifySignature(params):
    * mac = HMAC-SHA256(params.get("data"), "ZALOPAY_MOCK_KEY2")
    * Compare to params.get("mac")

- Intentionally use a DIFFERENT signature approach than VNPay/MoMo to show variation
```

### 3.5 PayPalSimulator.java — STYLE: OAuth2 token + REST order lifecycle

```
Implementation notes:
- getType() → PAYPAL
- State: maintain an in-memory Map<String, SimulatedPayPalOrder> for the "captured orders"
  (simulates what PayPal's API would track server-side)

- initiate():
    * Sleep processingDelayMs
    * "Get access token" — just generate a fake Bearer token:
      fakeToken = Base64("paypal_mock_token:" + System.currentTimeMillis())
    * "Create order" via mock:
      paypalOrderId = "PAYID-" + UUID.randomUUID().toString().toUpperCase().replace("-","").substring(0,17)
    * Store SimulatedPayPalOrder{id, amount, currency, status="CREATED", userId, orderId} in memory map
    * gatewayTransactionId = paypalOrderId
    * Redirect URL: "https://www.sandbox.paypal.com/simulate/checkoutnow?token={paypalOrderId}"
    * Apply failure-rate
    * rawResponse = JSON: { id, status, links:[{href, rel, method}], purchase_units }

- processCallback(params):
    * Expect params: paypalOrderId, payerId, eventType
    * Look up SimulatedPayPalOrder from memory map
    * "Capture payment": update stored order status to "COMPLETED"
    * Return SUCCESS if found and status was CREATED
    * verifySignature: check params contain a "paypal-auth-algo" header matching mock value

- verifySignature(params):
    * PayPal uses webhook signature verification — simulate:
      params must contain "paypal-transmission-id" and "paypal-auth-algo" == "SHA256withRSA"
      Return true if both present (mock — no real crypto for PayPal)

- queryStatus(gatewayTransactionId):
    * Look up in memory map → return current status

- refund(gatewayTransactionId, amount):
    * Find in memory map, mark as REFUNDED
    * refundId = "REFID-" + UUID randomUUID substring
```

### 3.6 StripeSimulator.java — STYLE: PaymentIntent lifecycle with idempotency keys

```
Implementation notes:
- getType() → STRIPE
- State: maintain in-memory Map<String, SimulatedStripeIntent> indexed by paymentIntentId

- initiate():
    * Sleep processingDelayMs
    * Generate paymentIntentId = "pi_" + randomAlphanumeric(24)
    * Generate clientSecret = paymentIntentId + "_secret_" + randomAlphanumeric(24)
    * Store SimulatedStripeIntent{id, clientSecret, amount, currency, status="requires_payment_method"} in map
    * gatewayTransactionId = paymentIntentId
    * Redirect URL: "https://checkout.stripe.com/simulate/pay/{clientSecret}"
    * Apply failure-rate
    * rawResponse = JSON: { id, object:"payment_intent", amount, currency, status, client_secret,
                             metadata:{orderId, userId}, created:<epoch> }

- processCallback(params):
    * Expect params: type (e.g. "payment_intent.succeeded"), data.object.id, stripe-signature
    * verifySignature first
    * type == "payment_intent.succeeded" → look up intent, mark status="succeeded" → SUCCESS
    * type == "payment_intent.payment_failed" → mark status="requires_payment_method" → FAILED

- verifySignature(params):
    * Stripe signature format: "t={timestamp},v1={hmac}"
    * Mock: compute HMAC-SHA256(timestamp + "." + payload, "STRIPE_MOCK_WEBHOOK_SECRET")
    * Compare to v1 value in params.get("stripe-signature")
    * IMPORTANT: Stripe's REAL verifySignature is timestamp-sensitive (5-min window).
                 In the simulator, skip the timestamp window check.

- queryStatus(gatewayTransactionId):
    * Look up in memory map

- refund(gatewayTransactionId, amount):
    * refundId = "re_" + randomAlphanumeric(24)
    * Update stored intent metadata
    * Return success
```

### 3.7 PaymentGatewayFactory.java

```java
// Pattern: Spring auto-registers all PaymentGateway beans into a Map at startup.
// No if/else. No switch. Adding a 6th gateway = implement interface + @Component.

@Component
public class PaymentGatewayFactory {

    private final Map<PaymentGatewayType, PaymentGateway> registry;

    public PaymentGatewayFactory(List<PaymentGateway> gateways) {
        this.registry = gateways.stream()
            .collect(Collectors.toUnmodifiableMap(
                PaymentGateway::getType,
                Function.identity()
            ));
        // Log all registered gateways at startup for visibility
        log.info("Registered {} payment gateway simulators: {}", registry.size(), registry.keySet());
    }

    public PaymentGateway get(PaymentGatewayType type) {
        return Optional.ofNullable(registry.get(type))
            .orElseThrow(() -> new UnsupportedGatewayException(
                "No simulator registered for gateway: " + type));
    }

    public Set<PaymentGatewayType> availableGateways() {
        return registry.keySet();
    }
}
```

---

## PHASE 3B — EXTERNAL SERVICE CLIENTS

> **AGENT NOTE**: These clients communicate with auth-service and order-service.
> Default mode is `mock` — all calls return deterministic fake data.
> Switch to `real` mode by changing `payment.external.auth.mode` or `payment.external.order.mode` to `real`.
> This pattern (interface + mock impl + real impl + @ConditionalOnProperty) makes it trivial to migrate.

### 3B.1 ExternalServiceConfig.java

```java
@ConfigurationProperties(prefix = "payment.external")
public record ExternalServiceConfig(
    AuthConfig auth,
    OrderConfig order
) {
    public record AuthConfig(
        String mode,         // "mock" or "real"
        String baseUrl,
        String jwtSecret
    ) {}

    public record OrderConfig(
        String mode,         // "mock" or "real"
        String baseUrl
    ) {}
}
```

### 3B.2 AuthServiceClient.java interface

```java
public interface AuthServiceClient {

    record AuthResult(Long userId, String email, String role) {}

    /**
     * Validate the bearer token and return the authenticated user's info.
     * In mock mode: parses mock-user-{userId}-{role} tokens.
     * In real mode: calls auth-service HTTP endpoint.
     */
    AuthResult validateTokenAndGetUser(String bearerToken);
}
```

### 3B.3 MockAuthServiceClient.java

```java
@Component
@ConditionalOnProperty(name = "payment.external.auth.mode", havingValue = "mock", matchIfMissing = true)
public class MockAuthServiceClient implements AuthServiceClient {

    private static final Pattern MOCK_TOKEN_PATTERN =
        Pattern.compile("mock-user-(\\d+)-(\\w+)");

    @Override
    public AuthResult validateTokenAndGetUser(String bearerToken) {
        if (bearerToken == null || !bearerToken.startsWith("mock-user-")) {
            throw new AuthenticationException("Invalid mock token format");
        }
        Matcher matcher = MOCK_TOKEN_PATTERN.matcher(bearerToken);
        if (!matcher.matches()) {
            throw new AuthenticationException("Invalid mock token format");
        }
        Long userId = Long.parseLong(matcher.group(1));
        String role = matcher.group(2);
        String email = "mock-" + userId + "@example.com";
        log.debug("Mock auth: userId={}, role={}", userId, role);
        return new AuthResult(userId, email, role);
    }
}
```

### 3B.4 RealAuthServiceClient.java

```java
@Component
@ConditionalOnProperty(name = "payment.external.auth.mode", havingValue = "real")
public class RealAuthServiceClient implements AuthServiceClient {

    private final WebClient webClient;
    private final ExternalServiceConfig config;

    public RealAuthServiceClient(WebClient.Builder webClientBuilder,
                                 ExternalServiceConfig config) {
        this.config = config;
        this.webClient = webClientBuilder
            .baseUrl(config.auth().baseUrl())
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .build();
    }

    @Override
    public AuthResult validateTokenAndGetUser(String bearerToken) {
        try {
            Map response = webClient.get()
                .uri("/api/auth/validate")
                .header(HttpHeaders.AUTHORIZATION, bearerToken)
                .retrieve()
                .bodyToMono(Map.class)
                .block(Duration.ofSeconds(5));

            Long userId = Long.valueOf(response.get("userId").toString());
            String email = (String) response.get("email");
            String role = (String) response.get("role");
            return new AuthResult(userId, email, role);
        } catch (Exception ex) {
            throw new AuthServiceUnavailableException(
                "Auth service unavailable: " + ex.getMessage());
        }
    }
}
```

> **Note**: If auth-service does not expose a `/api/auth/validate` endpoint, use local JWT parsing instead:
> Parse the JWT using `jjwt` with the shared `jwtSecret`. Extract `sub` (userId), `email`, `role` from claims.
> This approach avoids a network call and is more performant.

### 3B.5 OrderServiceClient.java interface

```java
public interface OrderServiceClient {

    record OrderValidationResult(
        boolean exists,
        Long userId,
        BigDecimal expectedAmount,
        String currency,
        String status
    ) {}

    /**
     * Validate that an order exists, belongs to the user, and matches the requested amount.
     * This prevents client-side tampering of the payment amount.
     * In mock mode: always returns a valid response matching the requested amount.
     * In real mode: calls order-service to get the authoritative order data.
     */
    OrderValidationResult validateOrderForPayment(Long orderId, Long userId, BigDecimal requestedAmount);
}
```

### 3B.6 MockOrderServiceClient.java

```java
@Component
@ConditionalOnProperty(name = "payment.external.order.mode", havingValue = "mock", matchIfMissing = true)
public class MockOrderServiceClient implements OrderServiceClient {

    @Override
    public OrderValidationResult validateOrderForPayment(
            Long orderId, Long userId, BigDecimal requestedAmount) {
        // Mock always returns a valid order matching the requested amount.
        // This lets the payment flow proceed without a real order-service.
        // In real mode, the order-service validates the amount server-side.
        log.debug("Mock order validation: orderId={}, userId={}, amount={}",
            orderId, userId, requestedAmount);
        return new OrderValidationResult(
            true,
            userId,                          // order belongs to this user
            requestedAmount,                 // amount matches client request
            "VND",
            "PENDING"
        );
    }
}
```

### 3B.7 RealOrderServiceClient.java

```java
@Component
@ConditionalOnProperty(name = "payment.external.order.mode", havingValue = "real")
public class RealOrderServiceClient implements OrderServiceClient {

    private final WebClient webClient;
    private final ExternalServiceConfig config;

    public RealOrderServiceClient(WebClient.Builder webClientBuilder,
                                   ExternalServiceConfig config) {
        this.config = config;
        this.webClient = webClientBuilder
            .baseUrl(config.order().baseUrl())
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .build();
    }

    @Override
    public OrderValidationResult validateOrderForPayment(
            Long orderId, Long userId, BigDecimal requestedAmount) {
        try {
            // Call order-service validation endpoint
            Map response = webClient.get()
                .uri(uriBuilder -> uriBuilder
                    .path("/api/orders/{orderId}/validate")
                    .queryParam("userId", userId)
                    .queryParam("amount", requestedAmount)
                    .build(orderId))
                .retrieve()
                .bodyToMono(Map.class)
                .block(Duration.ofSeconds(5));

            boolean exists = Boolean.TRUE.equals(response.get("exists"));
            Long orderUserId = Long.valueOf(response.get("userId").toString());
            BigDecimal expectedAmount = new BigDecimal(response.get("expectedAmount").toString());
            String currency = (String) response.get("currency");
            String status = (String) response.get("status");

            return new OrderValidationResult(exists, orderUserId, expectedAmount, currency, status);
        } catch (Exception ex) {
            throw new OrderServiceUnavailableException(
                "Order service unavailable: " + ex.getMessage());
        }
    }
}
```

> **Note**: When order-service is implemented, it must expose:
> `GET /api/orders/{orderId}/validate?userId={userId}&amount={amount}`
> Response: `{ exists, userId, expectedAmount, currency, status }`

### 3B.8 Mock Switching Pattern Summary

```
┌─────────────────────────────────────────────────────┐
│                 Spring Context                       │
│                                                     │
│  AuthServiceClient (interface)                      │
│       ▲           ▲                                 │
│       │           │                                 │
│  ┌────┴───┐  ┌───┴────┐                            │
│  │ Mock   │  │ Real   │                           │
│  │ @Cond  │  │ @Cond  │                           │
│  │(mode=  │  │(mode=  │                           │
│  │ mock)  │  │ real)  │                           │
│  └────────┘  └────────┘                           │
│                                                     │
│  OrderServiceClient (interface)                     │
│       ▲           ▲                                 │
│  ┌────┴───┐  ┌───┴────┐                            │
│  │ Mock   │  │ Real   │                           │
│  │ @Cond  │  │ @Cond  │                           │
│  └────────┘  └────────┘                            │
└─────────────────────────────────────────────────────┘
```

---

## PHASE 4 — PERSISTENCE

### Tasks

- [ ] **4.1** Create Flyway migration `V1__create_payment_transaction.sql`:

```sql
CREATE TABLE payment_transaction (
    id                      BIGSERIAL PRIMARY KEY,
    order_id                BIGINT          NOT NULL,
    user_id                 BIGINT          NOT NULL,
    amount                  NUMERIC(18, 2)  NOT NULL,
    currency                VARCHAR(10)     NOT NULL DEFAULT 'VND',
    gateway_type            VARCHAR(30)     NOT NULL,
    status                  VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    idempotency_key         VARCHAR(100)    NOT NULL,
    gateway_transaction_id  VARCHAR(200),
    simulated_redirect_url  TEXT,
    gateway_raw_response    TEXT,
    failure_reason          TEXT,
    retry_count             INT             NOT NULL DEFAULT 0,
    expired_at              TIMESTAMP,
    created_at              TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP       NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_idempotency_key      UNIQUE (idempotency_key),
    CONSTRAINT uq_gateway_transaction  UNIQUE (gateway_transaction_id),
    CONSTRAINT chk_status CHECK (
        status IN ('PENDING','PROCESSING','SUCCESS','FAILED','TIMEOUT','REFUNDED')
    ),
    CONSTRAINT chk_gateway CHECK (
        gateway_type IN ('VNPAY','MOMO','ZALOPAY','PAYPAL','STRIPE')
    )
);
```

- [ ] **4.2** Create `V2__create_indexes.sql`:

```sql
CREATE INDEX idx_payment_order_id   ON payment_transaction (order_id);
CREATE INDEX idx_payment_user_id    ON payment_transaction (user_id);
CREATE INDEX idx_payment_status     ON payment_transaction (status);
CREATE INDEX idx_payment_gateway    ON payment_transaction (gateway_type);
CREATE INDEX idx_payment_created    ON payment_transaction (created_at DESC);
-- Partial index for timeout sweep (only PROCESSING rows matter)
CREATE INDEX idx_payment_timeout    ON payment_transaction (expired_at)
    WHERE status = 'PROCESSING';
```

- [ ] **4.3** Create `PaymentTransactionJpaEntity.java` — JPA entity mapping the table 1:1.
  Use `@Enumerated(EnumType.STRING)` for status and gateway_type.
  Use `@CreationTimestamp` / `@UpdateTimestamp` from Hibernate.

- [ ] **4.4** Create `PaymentJpaRepository.java` extending `JpaRepository<PaymentTransactionJpaEntity, Long>`:

```java
Optional<PaymentTransactionJpaEntity> findByIdempotencyKey(String key);
Optional<PaymentTransactionJpaEntity> findByGatewayTransactionId(String id);
List<PaymentTransactionJpaEntity> findByOrderIdOrderByCreatedAtDesc(Long orderId);
List<PaymentTransactionJpaEntity> findByStatusAndExpiredAtBefore(String status, LocalDateTime cutoff);
Page<PaymentTransactionJpaEntity> findAll(Specification<PaymentTransactionJpaEntity> spec, Pageable pageable);
```

- [ ] **4.5** Create `PaymentRepositoryImpl.java` implementing `PaymentRepository` (domain interface).
  Map between JPA entity and domain model in this adapter — domain layer never imports JPA.

---

## PHASE 5 — CQRS USE CASES

### Command Side

- [ ] **5.1** Create `ProcessPaymentCommand.java` — @Service @Transactional:

```
FLOW (with external service validation):
1. Validate idempotency: paymentRepository.findByIdempotencyKey(key)
   → if found AND status != FAILED: throw IdempotentResponseException(existingTx)
2. [NEW] Validate order via OrderServiceClient:
   a. Inject OrderServiceClient
   b. Call orderClient.validateOrderForPayment(orderId, userId, requestedAmount)
   c. If !exists → throw OrderNotFoundException
   d. If orderUserId != userId → throw UnauthorizedOrderAccessException
   e. If expectedAmount != requestedAmount → throw PaymentAmountMismatchException
      (prevents client-side tampering of the payment amount)
3. Create PaymentTransaction aggregate (status=PENDING)
4. Save to DB (gets ID assigned)
5. Resolve gateway: gatewayFactory.get(req.gatewayType)
6. Call gateway.initiate(request)
7. If gateway returns success:
     tx.markProcessing(result.redirectUrl)
     tx.setGatewayTransactionId(result.gatewayTransactionId)
     tx.setGatewayRawResponse(result.rawResponse)
8. If gateway returns failure:
     tx.markFailed(result.errorMessage)
9. Save updated tx
10. Publish PaymentInitiatedEvent (if processing) or PaymentFailedEvent (if failed)
11. Return ProcessPaymentResponse with redirectUrl and transactionId

Dependencies injected:
   - PaymentRepository
   - PaymentGatewayFactory
   - OrderServiceClient
   - PaymentEventPublisher
```

- [ ] **5.2** Create `HandleCallbackCommand.java` — @Service @Transactional:

```
FLOW (called from any gateway's callback endpoint):
1. Extract gatewayType from params (or path variable)
2. Resolve gateway: gatewayFactory.get(gatewayType)
3. gateway.processCallback(params) → GatewayCallbackResult
4. If !result.verifiedSignature → throw InvalidSignatureException
5. Find PaymentTransaction by gatewayTransactionId
6. Apply status update:
   - result.success → tx.markSuccess(gatewayTxId, rawResponse)
                       → publish PaymentSucceededEvent
   - !result.success → tx.markFailed(reason)
                        → publish PaymentFailedEvent
7. Save and return
```

- [ ] **5.3** Create `RefundPaymentCommand.java` — @Service @Transactional (admin only):

```
FLOW:
1. Find transaction by id, must be status=SUCCESS
2. Resolve gateway: gatewayFactory.get(tx.gatewayType)
3. gateway.refund(tx.gatewayTransactionId, refundAmount)
4. tx.markRefunded()
5. Save, publish PaymentRefundedEvent
```

- [ ] **5.4** Create `CheckPaymentTimeoutsCommand.java` — @Service:

```
FLOW (called by @Scheduled every 60s):
1. paymentRepository.findProcessingExpiredBefore(LocalDateTime.now())
2. For each: tx.markTimedOut() → save → publish PaymentTimedOutEvent
3. Log count of timed-out transactions
```

### Query Side

- [ ] **5.5** Create `GetPaymentStatusQuery.java` — @Service @Transactional(readOnly=true)
  Find by transactionId, return PaymentStatusResponse DTO.

- [ ] **5.6** Create `GetOrderPaymentStatusQuery.java` — @Service @Transactional(readOnly=true)
  Find latest payment for orderId, return status.

- [ ] **5.7** Create `GetAvailableGatewaysQuery.java` — @Service
  Return `gatewayFactory.availableGateways()` as list of display objects:
  ```java
  record GatewayInfo(PaymentGatewayType type, String displayName, String description, boolean isMock)
  ```
  `isMock` is always `true` for all 5.
  displayName examples: "VNPay (Simulator)", "MoMo (Simulator)", etc.

- [ ] **5.8** Create `AdminListPaymentsQuery.java` — @Service @Transactional(readOnly=true)
  Accepts filter (status, gatewayType, fromDate, toDate, userId, orderId) and Pageable.

- [ ] **5.9** Create `AdminPaymentStatisticsQuery.java` — @Service @Transactional(readOnly=true)
  Return:
  ```java
  record PaymentStatistics(
      long totalTransactions,
      long successCount,
      long failedCount,
      long timeoutCount,
      BigDecimal totalRevenue,
      double successRate,
      Map<PaymentGatewayType, GatewayStats> byGateway
  )
  ```

---

## PHASE 6 — MESSAGING

### Tasks

- [ ] **6.1** Create `RabbitMQConfig.java`:

```java
// Exchange: "payment.events" (TopicExchange, durable)
// DLX:      "payment.events.dlx" (TopicExchange, durable)
// No queues defined here — other services bind their own queues.
// This service only publishes.
```

- [ ] **6.2** Create `PaymentEventPublisher.java`:

```java
@Component
public class PaymentEventPublisher {
    // Inject RabbitTemplate
    // Exchange: "payment.events"

    // Routing keys:
    //   PaymentInitiatedEvent  → "payment.initiated"
    //   PaymentSucceededEvent  → "payment.succeeded"
    //   PaymentFailedEvent     → "payment.failed"
    //   PaymentRefundedEvent   → "payment.refunded"
    //   PaymentTimedOutEvent   → "payment.timeout"

    // On RabbitMQ connection failure: LOG WARNING but do NOT throw.
    // Payment DB write is the source of truth; messaging is best-effort.
    public void publish(PaymentEvent event) {
        try {
            String routingKey = resolveRoutingKey(event);
            rabbitTemplate.convertAndSend("payment.events", routingKey, event);
            log.debug("Published event: {} with key: {}", event.getClass().getSimpleName(), routingKey);
        } catch (Exception ex) {
            log.warn("Failed to publish event {}: {}", event.getClass().getSimpleName(), ex.getMessage());
        }
    }
}
```

---

## PHASE 7 — REST CONTROLLERS

### Tasks

- [ ] **7.1** Create `PaymentController.java` — public / user endpoints:

```
POST   /api/payment/process
       Headers: Authorization: Bearer <token>, Idempotency-Key: <uuid>
       Body: { orderId, amount, currency, gatewayType, returnUrl }
       → ProcessPaymentCommand.execute()
       → 200: { success:true, data:{ transactionId, status, redirectUrl, gatewayType, expiredAt } }

GET    /api/payment/gateways
       → GetAvailableGatewaysQuery
       → 200: { success:true, data: [ { type, displayName, description, isMock } ] }

GET    /api/payment/status/{transactionId}
       Requires: JWT (user can only see their own)
       → GetPaymentStatusQuery

GET    /api/payment/order/{orderId}/status
       Requires: JWT
       → GetOrderPaymentStatusQuery
```

- [ ] **7.2** Create `PaymentCallbackController.java` — gateway callback endpoints (no auth):

```
POST   /api/payment/callback/{gatewayType}
       Generic callback endpoint for MoMo, ZaloPay
       → Extract gatewayType from path, pass all params to HandleCallbackCommand
       → For VNPay IPN: return String "RspCode=00&Message=OK" (not JSON)
       → For others: return { returnCode: 1, returnMessage: "OK" }

GET    /api/payment/vnpay/return
       Browser redirect return URL for VNPay
       → Redirect to frontend with status query param
       → No auth required (user's browser follows redirect from VNPay)

POST   /api/payment/stripe/webhook
       Stripe sends JSON body with Stripe-Signature header
       → Different from other callbacks: body is raw JSON, not form params
       → Verify Stripe-Signature via StripeSimulator.verifySignature

POST   /api/payment/paypal/webhook
       PayPal webhook
       → Verify paypal-auth-algo header
```

- [ ] **7.3** Create `AdminPaymentController.java` — admin endpoints (ROLE_ADMIN):

```
GET    /api/admin/payments
       Query params: status, gatewayType, fromDate, toDate, page, size
       → AdminListPaymentsQuery

GET    /api/admin/payments/{id}
       → PaymentRepository.findById

POST   /api/admin/payments/{id}/refund
       Body: { refundAmount, reason }
       → RefundPaymentCommand

POST   /api/admin/payments/check-timeouts
       Manual trigger for timeout sweep
       → CheckPaymentTimeoutsCommand

GET    /api/admin/payments/statistics
       Query params: fromDate, toDate
       → AdminPaymentStatisticsQuery
```

### 7.4 Response format — use consistently:

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "timestamp": "2026-06-13T10:00:00Z"
}
```

On error:
```json
{
  "success": false,
  "data": null,
  "error": { "code": "PAYMENT_NOT_FOUND", "message": "...", "details": {} },
  "timestamp": "2026-06-13T10:00:00Z"
}
```

---

## PHASE 8 — SECURITY & CROSS-CUTTING

### Tasks

- [ ] **8.1** Create `SecurityConfig.java`:

```java
// STATELESS sessions. JWT validation via JwtAuthFilter (extract userId + roles from token).
// Public paths (no auth needed):
//   GET  /api/payment/gateways
//   POST /api/payment/callback/**
//   GET  /api/payment/vnpay/return
//   POST /api/payment/stripe/webhook
//   POST /api/payment/paypal/webhook
//   GET  /actuator/health
// Authenticated (any valid JWT):
//   POST /api/payment/process
//   GET  /api/payment/status/**
//   GET  /api/payment/order/**
// Admin only:
//   /api/admin/**
```

> **AUTH INTEGRATION**: Use `AuthServiceClient` instead of inline token parsing.
> `JwtAuthFilter` injects `AuthServiceClient` and calls `validateTokenAndGetUser(bearerToken)`.
> - In mock mode: parses `mock-user-{userId}-{role}` tokens (no HTTP call)
> - In real mode: calls auth-service endpoint or parses JWT locally with shared secret
> - Filter extracts `userId`, `email`, `role` and sets in SecurityContext
> - No duplicate validation — filter runs once per request, command classes reuse the SecurityContext userId

- [ ] **8.2** Create `GlobalExceptionHandler.java` `@RestControllerAdvice`:

```
Handle:
- IdempotentResponseException    → 200 (return original response)
- DuplicatePaymentException      → 409
- PaymentNotFoundException       → 404
- OrderNotFoundException         → 404
- UnauthorizedOrderAccessException → 403
- PaymentAmountMismatchException → 400
- InvalidSignatureException      → 400 with message "Signature verification failed"
- UnsupportedGatewayException    → 400
- InvalidPaymentStateException   → 422
- AuthServiceUnavailableException → 503
- OrderServiceUnavailableException → 503
- AuthenticationException        → 401
- MethodArgumentNotValidException → 400 with field errors
- Generic Exception              → 500 (log error, return generic message)
```

- [ ] **8.3** Create `CorrelationIdFilter.java` — `@Component` `OncePerRequestFilter`:
  - Read `X-Correlation-ID` header (or generate UUID if absent)
  - Put in MDC as `correlationId`
  - Copy to response header
  - Clear MDC after request

---

## PHASE 9 — TESTS

### Tasks

- [ ] **9.1** `VNPaySimulatorTest.java`:

```java
// Test: initiate() returns non-null redirectUrl containing "simulate"
// Test: initiate() with failure-rate=1.0 returns failed result
// Test: verifySignature() with correct params returns true
// Test: verifySignature() with tampered amount returns false
// Test: processCallback() with vnp_ResponseCode="00" returns SUCCESS
// Test: processCallback() with vnp_ResponseCode="51" (insufficient funds) returns FAILED
// Test: refund() returns refundId starting with "VNPREF"
```

- [ ] **9.2** `MoMoSimulatorTest.java`:

```java
// Test: initiate() returns QR-style URL containing "momo"
// Test: gatewayTransactionId starts with "MOMO"
// Test: verifySignature() validates correctly
// Test: processCallback() with resultCode="0" returns SUCCESS
// Test: processCallback() with resultCode="11" returns FAILED
```

- [ ] **9.3** `ZaloPaySimulatorTest.java`:

```java
// Test: initiate() returns token in redirectUrl
// Test: gatewayTransactionId starts with "ZLP"
// Test: verifySignature() uses correct key (key2, not key1)
// Test: processCallback() with correct mac and type=1 returns SUCCESS
```

- [ ] **9.4** `PayPalSimulatorTest.java`:

```java
// Test: initiate() returns PAYID- prefixed gatewayTransactionId
// Test: initiating stores order in memory map
// Test: processCallback() after initiate() marks order COMPLETED
// Test: queryStatus() reflects captured state
// Test: refund() marks order as REFUNDED in memory
// Test: second processCallback with same orderId is idempotent
```

- [ ] **9.5** `StripeSimulatorTest.java`:

```java
// Test: initiate() returns pi_ prefixed intent id and client_secret
// Test: processCallback() with payment_intent.succeeded marks SUCCESS
// Test: processCallback() with payment_intent.payment_failed marks FAILED
// Test: verifySignature() validates HMAC correctly
// Test: queryStatus() returns current intent status from memory
```

- [ ] **9.6** `ProcessPaymentCommandTest.java` with Mockito:

```java
// Test: duplicate idempotency key throws IdempotentResponseException
// Test: successful flow calls gateway.initiate() exactly once
// Test: gateway failure marks transaction FAILED and publishes PaymentFailedEvent
// Test: transaction is saved with correct status after initiation
// Test: order not found → throws OrderNotFoundException
// Test: userId mismatch → throws UnauthorizedOrderAccessException
// Test: amount mismatch → throws PaymentAmountMismatchException
// Test: valid order passes through to gateway initiation (mock returns valid)
```

- [ ] **9.7** `PaymentFlowIntegrationTest.java` — `@SpringBootTest` with H2:

```java
// Test: full VNPAY flow: process → callback → SUCCESS status
// Test: full MOMO flow: process → callback → SUCCESS status
// Test: timeout flow: process → wait → timeout sweep → TIMEOUT status
// Test: refund flow: process → callback → refund → REFUNDED status
// Test: duplicate payment same idempotency key → same transaction returned
// Test: concurrent requests with same idempotency key → only one transaction created
```

- [ ] **9.8** `ExternalServiceClientTest.java` — tests for external client mock implementations:

```java
// MockAuthServiceClientTest:
// Test: valid mock token "mock-user-42-USER" → AuthResult(userId=42, role="USER")
// Test: valid mock token "mock-user-1-ADMIN" → AuthResult(userId=1, role="ADMIN")
// Test: invalid token format → throws AuthenticationException
// Test: null token → throws AuthenticationException

// MockOrderServiceClientTest:
// Test: validateOrderForPayment returns exists=true, amount=matches requested
// Test: validateOrderForPayment returns userId matching input userId
// Test: validateOrderForPayment returns status="PENDING"
// Test: validateOrderForPayment always returns currency="VND"

// RealAuthServiceClientTest (with WireMock for mock server):
// Test: auth-service returns 200 → AuthResult parsed correctly
// Test: auth-service returns 401 → throws AuthenticationException
// Test: auth-service unavailable → throws AuthServiceUnavailableException

// RealOrderServiceClientTest (with WireMock for mock server):
// Test: order-service returns valid order → OrderValidationResult parsed correctly
// Test: order-service returns not found → OrderNotFoundException
// Test: order-service returns mismatched amount → PaymentAmountMismatchException
// Test: order-service unavailable → throws OrderServiceUnavailableException
```

---

## PHASE 10 — MOCK ENDPOINT FOR FRONTEND TESTING

> **EXTRA**: Add a test-helper controller to make manual testing easy without needing a real frontend.

- [ ] **10.1** Create `SimulatorTestController.java` (only active when profile `dev` or `test`):

```
POST   /api/simulator/trigger-callback
       Body: { transactionId, gatewayType, success: true/false }
       → Manually trigger a callback for a transaction
       → Useful for testing the full flow without a real gateway redirect
       → Should call HandleCallbackCommand with synthetic params

GET    /api/simulator/transactions
       → Return last 20 transactions (no auth required)
       → Useful for debugging

POST   /api/simulator/reset
       → Delete all test transactions from DB
       → Clear all in-memory PayPal/Stripe simulator state

- [ ] **10.2** Add order validation error simulation to test controller:

```
POST   /api/simulator/set-mock-order-response
       Body: { orderId, exists: false, userId, amount, errorType }
       → Configure MockOrderServiceClient to return specific error responses
       → errorType: "NOT_FOUND", "USER_MISMATCH", "AMOUNT_MISMATCH"
       → Useful for testing payment rejection flows without a real order-service

       Example: { orderId: 999, exists: false, errorType: "NOT_FOUND" }
       → Future /api/payment/process with orderId=999 will fail with ORDER_NOT_FOUND
```

---

## ERROR CODES REFERENCE

| Code | HTTP | When |
|------|------|------|
| `PAYMENT_NOT_FOUND` | 404 | No transaction with given ID |
| `DUPLICATE_PAYMENT` | 409 | Same orderId already has SUCCESS payment |
| `IDEMPOTENT_RESPONSE` | 200 | Same idempotency key, return prior result |
| `INVALID_SIGNATURE` | 400 | Gateway callback signature mismatch |
| `UNSUPPORTED_GATEWAY` | 400 | gatewayType not in enum |
| `INVALID_STATE_TRANSITION` | 422 | e.g. refunding a PENDING payment |
| `GATEWAY_SIMULATION_ERROR` | 502 | Simulator threw unexpected exception |
| `ORDER_NOT_FOUND` | 404 | orderId does not exist in order-service |
| `ORDER_USER_MISMATCH` | 403 | order owner != authenticated user |
| `PAYMENT_AMOUNT_MISMATCH` | 400 | requested amount != order's expected amount |
| `AUTH_SERVICE_UNAVAILABLE` | 503 | cannot reach auth-service (real mode) |
| `ORDER_SERVICE_UNAVAILABLE` | 503 | cannot reach order-service (real mode) |
| `INSUFFICIENT_PERMISSION` | 403 | Non-admin calling admin endpoint |

---

## COMPLETE API SURFACE

| Method | Path | Auth | Handler |
|--------|------|------|---------|
| POST | /api/payment/process | JWT | ProcessPaymentCommand |
| GET | /api/payment/gateways | None | GetAvailableGatewaysQuery |
| GET | /api/payment/status/{transactionId} | JWT | GetPaymentStatusQuery |
| GET | /api/payment/order/{orderId}/status | JWT | GetOrderPaymentStatusQuery |
| POST | /api/payment/callback/{gatewayType} | None | HandleCallbackCommand |
| GET | /api/payment/vnpay/return | None | HandleCallbackCommand (VNPay browser) |
| POST | /api/payment/stripe/webhook | None | HandleCallbackCommand (Stripe) |
| POST | /api/payment/paypal/webhook | None | HandleCallbackCommand (PayPal) |
| GET | /api/admin/payments | ADMIN | AdminListPaymentsQuery |
| GET | /api/admin/payments/{id} | ADMIN | AdminGetPaymentQuery |
| POST | /api/admin/payments/{id}/refund | ADMIN | RefundPaymentCommand |
| POST | /api/admin/payments/check-timeouts | ADMIN | CheckPaymentTimeoutsCommand |
| GET | /api/admin/payments/statistics | ADMIN | AdminPaymentStatisticsQuery |
| POST | /api/simulator/trigger-callback | None (dev) | SimulatorTestController |
| GET | /api/simulator/transactions | None (dev) | SimulatorTestController |
| POST | /api/simulator/reset | None (dev) | SimulatorTestController |

---

## AGENT CHECKLIST — DO NOT SKIP

Before declaring the implementation complete, verify ALL of the following:

### Build
- [ ] `./mvnw clean compile` — zero errors
- [ ] `./mvnw test` — all tests pass
- [ ] No `@SuppressWarnings` used to hide errors

### Mock Gateway Verification
- [ ] VNPaySimulator generates gatewayTransactionId starting with `VNP`
- [ ] MoMoSimulator generates gatewayTransactionId starting with `MOMO`
- [ ] ZaloPaySimulator generates gatewayTransactionId starting with `ZLP`
- [ ] PayPalSimulator generates gatewayTransactionId starting with `PAYID-`
- [ ] StripeSimulator generates gatewayTransactionId starting with `pi_`
- [ ] Each simulator uses a DIFFERENT signature algorithm / field set
- [ ] PayPal and Stripe simulators maintain separate in-memory state maps
- [ ] All 5 simulators respect `failure-rate` config (0.0 in tests = always succeed)

### CQRS Verification
- [ ] No query class calls `save()` or mutates state
- [ ] No command class is annotated `@Transactional(readOnly=true)`
- [ ] Commands publish domain events AFTER successful DB save
- [ ] `PaymentTransaction` is the ONLY place status transitions happen

### Factory Method Verification
- [ ] `PaymentGatewayFactory` contains NO `if/else` or `switch` on gateway type
- [ ] Adding a 6th gateway requires ONLY: implement interface + `@Component`
- [ ] Factory logs all registered gateways at startup

### Idempotency Verification
- [ ] Duplicate `Idempotency-Key` returns 200 with original response (not 4xx)
- [ ] DB has UNIQUE constraint on `idempotency_key`
- [ ] Concurrent duplicate requests handled gracefully (catch `DataIntegrityViolationException`)

### Security Verification
- [ ] `/api/admin/**` returns 403 without `ADMIN` role
- [ ] Callback endpoints return 200 without any Authorization header
- [ ] Mock JWT format `Bearer mock-user-{id}-{role}` works for testing

### Simulator Test Endpoint
- [ ] `POST /api/simulator/trigger-callback` can simulate SUCCESS for any gateway
- [ ] `POST /api/simulator/trigger-callback` can simulate FAILURE for any gateway
- [ ] `GET /api/simulator/transactions` returns recent transactions
- [ ] `POST /api/simulator/set-mock-order-response` can simulate order validation errors

### External Service Integration Verification
- [ ] `MockAuthServiceClient` registered when `payment.external.auth.mode=mock` (default)
- [ ] `RealAuthServiceClient` registered when `payment.external.auth.mode=real`
- [ ] Mock token `Bearer mock-user-42-USER` is parsed to `AuthResult(userId=42, role=USER)`
- [ ] Invalid mock token throws `AuthenticationException`
- [ ] `MockOrderServiceClient` registered when `payment.external.order.mode=mock` (default)
- [ ] `RealOrderServiceClient` registered when `payment.external.order.mode=real`
- [ ] Mock order validation returns `exists=true` matching requested amount
- [ ] `ProcessPaymentCommand` validates order via `OrderServiceClient` before gateway initiation
- [ ] Order not found → `OrderNotFoundException` (404)
- [ ] User mismatch → `UnauthorizedOrderAccessException` (403)
- [ ] Amount mismatch → `PaymentAmountMismatchException` (400)
- [ ] Switching to real mode: only change `mode: mock` → `mode: real` in config

---

## IMPORTANT REMINDERS FOR AGENT

1. **NO REAL GATEWAY CALLS**: Never make HTTP requests to real gateway URLs. All network calls go to the simulator classes, not the internet.

2. **MOCK CREDENTIALS**: All secrets/keys in config are fake strings like `"VNPAY_MOCK_SECRET_KEY_FOR_SIMULATION"`. They are used for HMAC computations inside the simulator to demonstrate the signature pattern, not for authenticating with real services.

3. **DIFFERENT IMPLEMENTATIONS**: Each of the 5 simulators MUST feel distinctly different:
   - VNPay: form-param style, HMAC-SHA512, sorted params
   - MoMo: fixed-field-order string, HMAC-SHA256
   - ZaloPay: JSON data field + separate MAC, two different keys
   - PayPal: OAuth token simulation, in-memory order lifecycle, header-based auth
   - Stripe: PaymentIntent lifecycle, webhook JSON body, timestamp-based HMAC

4. **IN-MEMORY STATE**: PayPal and Stripe simulators use `ConcurrentHashMap` for their in-memory stores. Document that this state is lost on restart (acceptable for simulator).

5. **FAILURE RATE**: The configurable failure-rate is purely random (`Math.random() < failureRate`). In test profile it is always 0.0 for deterministic tests.

6. **LOGGING**: Every gateway operation must log at DEBUG: what was requested, what was generated, whether it succeeded or simulated failure.

7. **EXTERNAL SERVICE INTEGRATION**: Both auth and order service clients are implemented as interface + mock/real pair. Default is mock. Swap to real by changing `payment.external.auth.mode` and `payment.external.order.mode` in `application.yaml`. The `@ConditionalOnProperty` pattern means only one implementation is active at a time — no code changes needed to switch.

8. **ANTI-TAMPERING**: The `OrderServiceClient.validateOrderForPayment()` step in `ProcessPaymentCommand` is critical security. It ensures the client cannot send a different amount than what the order-service has on record. Without this, a malicious client could change `amount` in the payment request to `1` and pay 1 VND for a 1,000,000 VND order.