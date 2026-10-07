-- ============================================================================
-- CAMPUS OPPORTUNITY HUB — PHYSICAL DATABASE MIGRATION
-- Description: Add index for notifications ordered by user and created_at DESC
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_notifications_user_created_at
ON notifications (user_id, created_at DESC);
