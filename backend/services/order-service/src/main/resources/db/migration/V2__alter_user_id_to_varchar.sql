-- Change user_id from BIGINT to VARCHAR(36) to match auth-service JWT sub (UUID format)
ALTER TABLE orders ALTER COLUMN user_id TYPE VARCHAR(36);
