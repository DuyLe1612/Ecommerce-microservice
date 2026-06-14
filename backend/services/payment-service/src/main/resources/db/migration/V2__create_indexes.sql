CREATE INDEX idx_payment_order_id   ON payment_transaction (order_id);
CREATE INDEX idx_payment_user_id    ON payment_transaction (user_id);
CREATE INDEX idx_payment_status     ON payment_transaction (status);
CREATE INDEX idx_payment_gateway    ON payment_transaction (gateway_type);
CREATE INDEX idx_payment_created    ON payment_transaction (created_at DESC);
CREATE INDEX idx_payment_timeout    ON payment_transaction (expired_at)
    WHERE status = 'PROCESSING';
