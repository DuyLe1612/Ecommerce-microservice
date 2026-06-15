-- Order status values
CREATE TYPE order_status AS ENUM (
    'PENDING_PAYMENT',
    'PAID',
    'PROCESSING',
    'SHIPPING',
    'DELIVERED',
    'CANCELLED'
);

CREATE TABLE orders (
    id                      BIGSERIAL PRIMARY KEY,
    order_number            VARCHAR(50)      NOT NULL UNIQUE,
    user_id                 BIGINT          NOT NULL,
    status                  VARCHAR(50)      NOT NULL DEFAULT 'PENDING_PAYMENT',
    subtotal_amount         NUMERIC(18, 2)  NOT NULL,
    subtotal_currency       VARCHAR(10)      NOT NULL DEFAULT 'VND',
    discount_amount         NUMERIC(18, 2)  NOT NULL DEFAULT 0,
    discount_currency       VARCHAR(10)     NOT NULL DEFAULT 'VND',
    shipping_fee_amount     NUMERIC(18, 2)  NOT NULL DEFAULT 0,
    shipping_fee_currency    VARCHAR(10)     NOT NULL DEFAULT 'VND',
    total_amount            NUMERIC(18, 2)  NOT NULL,
    total_currency          VARCHAR(10)     NOT NULL DEFAULT 'VND',
    coupon_code             VARCHAR(100),
    coupon_id               BIGINT,
    notes                   TEXT,
    shipping_recipient_name VARCHAR(200),
    shipping_phone          VARCHAR(20),
    shipping_street_address VARCHAR(500),
    shipping_city          VARCHAR(100),
    shipping_district      VARCHAR(100),
    shipping_ward          VARCHAR(100),
    shipping_postal_code   VARCHAR(20),
    created_at              TIMESTAMP        NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP        NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_user_id       ON orders (user_id);
CREATE INDEX idx_orders_status        ON orders (status);
CREATE INDEX idx_orders_order_number  ON orders (order_number);
CREATE INDEX idx_orders_created       ON orders (created_at DESC);

-- Order items table (one order has many items)
CREATE TABLE order_items (
    id                BIGSERIAL PRIMARY KEY,
    order_id          BIGINT          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id        BIGINT          NOT NULL,
    product_name      VARCHAR(500)    NOT NULL,
    quantity          INT             NOT NULL CHECK (quantity > 0),
    unit_price       NUMERIC(18, 2)  NOT NULL,
    subtotal         NUMERIC(18, 2)  NOT NULL
);

CREATE INDEX idx_order_items_order_id   ON order_items (order_id);
CREATE INDEX idx_order_items_product_id ON order_items (product_id);

-- Full-text search index for product verification
CREATE INDEX idx_order_items_user_product ON order_items (product_id)
    INCLUDE (order_id);
