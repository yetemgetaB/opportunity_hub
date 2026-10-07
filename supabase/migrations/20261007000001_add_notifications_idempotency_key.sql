-- ============================================================================
-- CAMPUS OPPORTUNITY HUB — PHYSICAL DATABASE MIGRATION
-- Description: Add idempotency_key column and unique constraint to notifications
-- ============================================================================

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS idempotency_key text;

CREATE UNIQUE INDEX IF NOT EXISTS uq_notifications_idempotency_key
ON notifications (idempotency_key);
