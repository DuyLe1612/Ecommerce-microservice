CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL,
    subtotal_amount DECIMAL(14,2) NOT NULL,
    subtotal_currency VARCHAR(3) NOT NULL,
    discount_amount DECIMAL(14,2) NOT NULL,
    discount_currency VARCHAR(3) NOT NULL,
    shipping_fee_amount DECIMAL(14,2) NOT NULL,
    shipping_fee_currency VARCHAR(3) NOT NULL,
    total_amount DECIMAL(14,2) NOT NULL,
    total_currency VARCHAR(3) NOT NULL,
    coupon_code VARCHAR(100),
    coupon_id BIGINT,
    notes TEXT,
    shipping_recipient_name VARCHAR(255),
    shipping_phone VARCHAR(20),
    shipping_street_address VARCHAR(500),
    shipping_city VARCHAR(100),
    shipping_district VARCHAR(100),
    shipping_ward VARCHAR(100),
    shipping_postal_code VARCHAR(20),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_image_url TEXT,
    quantity INT NOT NULL,
    unit_price DECIMAL(14,2) NOT NULL,
    subtotal DECIMAL(14,2) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
