-- ============================================================================
-- CAMPUS OPPORTUNITY HUB — SECURITY HARDENING MIGRATION (v2.2)
-- Description: Restrict direct RPC execution on internal functions & harden candidate view
-- Author: APEX Hackathon Architecture Team
-- ============================================================================

-- 1. Restrict direct RPC execution on trigger-only functions
-- These functions are invoked exclusively by PostgreSQL triggers in a trigger context
-- and should never be callable via external PostgREST RPC endpoints.
REVOKE EXECUTE ON FUNCTION public.fn_protect_user_role() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fn_update_timestamp() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fn_validate_attempt_opportunity() FROM PUBLIC, anon, authenticated;

-- 2. Restrict direct RPC execution on helper functions from anonymous users
-- These functions are used by Row Level Security (RLS) policies for authenticated sessions.
REVOKE EXECUTE ON FUNCTION public.auth_user_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.auth_user_role() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_org_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_org_member(uuid) TO authenticated;

-- 3. Harden the candidate-facing assessment view
-- Enable security_barrier to prevent query planner optimization leaks / side-channels
-- while preserving SECURITY DEFINER semantics necessary for candidate question delivery.
ALTER VIEW public.candidate_assessment_questions SET (security_barrier = true);
