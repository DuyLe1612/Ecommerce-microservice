-- Migrate user_id from BIGINT to VARCHAR(36) to support UUID user IDs
-- Previously stored numeric hash; now stores raw UUID string from auth-service JWT sub claim.
ALTER TABLE payment_transaction ALTER COLUMN user_id TYPE VARCHAR(36);
