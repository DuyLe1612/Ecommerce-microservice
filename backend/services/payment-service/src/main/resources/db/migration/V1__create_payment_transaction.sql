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
