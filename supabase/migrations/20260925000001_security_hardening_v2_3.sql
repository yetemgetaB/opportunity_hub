-- ============================================================================
-- CAMPUS OPPORTUNITY HUB — SECURITY & PERFORMANCE HARDENING MIGRATION (v2.3)
-- Description: Foreign key covering indexes & RLS InitPlan scalar subquery optimizations
-- Author: APEX Hackathon Architecture Team
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. FOREIGN KEY COVERING INDEXES
-- Resolves Supabase Advisor unindexed foreign key warnings to optimize join/cascade performance
-- ----------------------------------------------------------------------------

-- Covering index for assessment_answers -> assessment_attempts (attempt_id, assessment_id)
CREATE INDEX IF NOT EXISTS idx_answers_attempt_assessment 
ON public.assessment_answers (assessment_attempt_id, assessment_id);

-- Covering index for assessment_answers -> assessment_questions (question_id, assessment_id)
CREATE INDEX IF NOT EXISTS idx_answers_question_assessment 
ON public.assessment_answers (assessment_question_id, assessment_id);

-- Covering index for assessment_results -> users (human_evaluator_id)
CREATE INDEX IF NOT EXISTS idx_assessment_results_evaluator 
ON public.assessment_results (human_evaluator_id) 
WHERE human_evaluator_id IS NOT NULL;

-- Covering index for reports -> users (resolved_by)
CREATE INDEX IF NOT EXISTS idx_reports_resolved_by 
ON public.reports (resolved_by) 
WHERE resolved_by IS NOT NULL;

-- Covering index for saved_opportunities -> opportunities (opportunity_id)
CREATE INDEX IF NOT EXISTS idx_saved_opps_opp_id 
ON public.saved_opportunities (opportunity_id);

-- ----------------------------------------------------------------------------
-- 2. RLS INITPLAN PERFORMANCE OPTIMIZATIONS
-- Wraps auth helper calls in scalar subqueries (SELECT ...) to ensure one-time InitPlan evaluation
-- ----------------------------------------------------------------------------

-- Table: users
DROP POLICY IF EXISTS "users_select" ON public.users;
CREATE POLICY "users_select" ON public.users
FOR SELECT USING (
    id = (SELECT auth.uid())
    OR (SELECT auth_user_role()) = 'ADMIN'
    OR EXISTS (
        SELECT 1 FROM public.student_profiles sp
        WHERE sp.user_id = users.id
          AND sp.is_discoverable = true
    )
    OR EXISTS (
        SELECT 1 FROM public.applications a
        JOIN public.opportunities o ON a.opportunity_id = o.id
        WHERE a.student_profile_id = users.id
          AND is_org_member(o.organization_id)
    )
);

DROP POLICY IF EXISTS "users_insert_self" ON public.users;
CREATE POLICY "users_insert_self" ON public.users
FOR INSERT WITH CHECK (
    id = (SELECT auth.uid())
);

DROP POLICY IF EXISTS "users_update_self" ON public.users;
CREATE POLICY "users_update_self" ON public.users
FOR UPDATE USING (
    id = (SELECT auth.uid()) OR (SELECT auth_user_role()) = 'ADMIN'
)
WITH CHECK (
    id = (SELECT auth.uid()) OR (SELECT auth_user_role()) = 'ADMIN'
);

-- Table: student_profiles
DROP POLICY IF EXISTS "student_profiles_select" ON public.student_profiles;
CREATE POLICY "student_profiles_select" ON public.student_profiles
FOR SELECT USING (
    user_id = (SELECT auth.uid())
    OR (SELECT auth_user_role()) = 'ADMIN'
    OR is_discoverable = true
    OR EXISTS (
        SELECT 1 FROM public.applications a
        JOIN public.opportunities o ON a.opportunity_id = o.id
        WHERE a.student_profile_id = student_profiles.user_id
          AND is_org_member(o.organization_id)
    )
);

DROP POLICY IF EXISTS "student_profiles_insert_own" ON public.student_profiles;
CREATE POLICY "student_profiles_insert_own" ON public.student_profiles
FOR INSERT WITH CHECK (
    user_id = (SELECT auth.uid()) AND (SELECT auth_user_role()) = 'STUDENT'
);

DROP POLICY IF EXISTS "student_profiles_update_own" ON public.student_profiles;
CREATE POLICY "student_profiles_update_own" ON public.student_profiles
FOR UPDATE USING (
    user_id = (SELECT auth.uid()) OR (SELECT auth_user_role()) = 'ADMIN'
);

-- Table: student_skills
DROP POLICY IF EXISTS "student_skills_select" ON public.student_skills;
CREATE POLICY "student_skills_select" ON public.student_skills
FOR SELECT USING (
    student_profile_id = (SELECT auth.uid())
    OR (SELECT auth_user_role()) = 'ADMIN'
    OR EXISTS (
        SELECT 1 FROM public.student_profiles sp
        WHERE sp.user_id = student_skills.student_profile_id
          AND (sp.is_discoverable = true OR EXISTS (
              SELECT 1 FROM public.applications a
              JOIN public.opportunities o ON a.opportunity_id = o.id
              WHERE a.student_profile_id = sp.user_id
                AND is_org_member(o.organization_id)
          ))
    )
);

DROP POLICY IF EXISTS "student_skills_manage_own" ON public.student_skills;
CREATE POLICY "student_skills_manage_own" ON public.student_skills
FOR ALL USING (
    student_profile_id = (SELECT auth.uid()) OR (SELECT auth_user_role()) = 'ADMIN'
);

-- Table: experiences
DROP POLICY IF EXISTS "experiences_select" ON public.experiences;
CREATE POLICY "experiences_select" ON public.experiences
FOR SELECT USING (
    student_profile_id = (SELECT auth.uid())
    OR (SELECT auth_user_role()) = 'ADMIN'
    OR EXISTS (
        SELECT 1 FROM public.student_profiles sp
        WHERE sp.user_id = experiences.student_profile_id
          AND (sp.is_discoverable = true OR EXISTS (
              SELECT 1 FROM public.applications a
              JOIN public.opportunities o ON a.opportunity_id = o.id
              WHERE a.student_profile_id = sp.user_id
                AND is_org_member(o.organization_id)
          ))
    )
);

DROP POLICY IF EXISTS "experiences_manage_own" ON public.experiences;
CREATE POLICY "experiences_manage_own" ON public.experiences
FOR ALL USING (
    student_profile_id = (SELECT auth.uid()) OR (SELECT auth_user_role()) = 'ADMIN'
);

-- Table: cvs
DROP POLICY IF EXISTS "cvs_select" ON public.cvs;
CREATE POLICY "cvs_select" ON public.cvs
FOR SELECT USING (
    student_profile_id = (SELECT auth.uid())
    OR (SELECT auth_user_role()) = 'ADMIN'
    OR EXISTS (
        SELECT 1 FROM public.applications a
        JOIN public.opportunities o ON a.opportunity_id = o.id
        WHERE a.student_profile_id = cvs.student_profile_id
          AND is_org_member(o.organization_id)
    )
);

DROP POLICY IF EXISTS "cvs_manage_own" ON public.cvs;
CREATE POLICY "cvs_manage_own" ON public.cvs
FOR ALL USING (
    student_profile_id = (SELECT auth.uid()) OR (SELECT auth_user_role()) = 'ADMIN'
);

-- Table: organizations
DROP POLICY IF EXISTS "organizations_select" ON public.organizations;
CREATE POLICY "organizations_select" ON public.organizations
FOR SELECT USING (
    (verification_status = 'APPROVED' AND deleted_at IS NULL)
    OR is_org_member(id)
    OR (SELECT auth_user_role()) = 'ADMIN'
);

DROP POLICY IF EXISTS "organizations_insert" ON public.organizations;
CREATE POLICY "organizations_insert" ON public.organizations
FOR INSERT WITH CHECK (
    (SELECT auth_user_role()) IN ('ORGANIZATION', 'ADMIN')
);

DROP POLICY IF EXISTS "organizations_update_member" ON public.organizations;
CREATE POLICY "organizations_update_member" ON public.organizations
FOR UPDATE USING (
    is_org_member(id) OR (SELECT auth_user_role()) = 'ADMIN'
);

-- Table: organization_members
DROP POLICY IF EXISTS "org_members_select" ON public.organization_members;
CREATE POLICY "org_members_select" ON public.organization_members
FOR SELECT USING (
    user_id = (SELECT auth.uid()) OR (SELECT auth_user_role()) = 'ADMIN'
);

DROP POLICY IF EXISTS "org_members_insert" ON public.organization_members;
CREATE POLICY "org_members_insert" ON public.organization_members
FOR INSERT WITH CHECK (
    user_id = (SELECT auth.uid())
    AND (SELECT auth_user_role()) IN ('ORGANIZATION', 'ADMIN')
);

-- Table: saved_opportunities
DROP POLICY IF EXISTS "saved_opps_manage_own" ON public.saved_opportunities;
CREATE POLICY "saved_opps_manage_own" ON public.saved_opportunities
FOR ALL USING (student_profile_id = (SELECT auth.uid()));

-- Table: applications
DROP POLICY IF EXISTS "applications_select" ON public.applications;
CREATE POLICY "applications_select" ON public.applications
FOR SELECT USING (
    student_profile_id = (SELECT auth.uid())
    OR (SELECT auth_user_role()) = 'ADMIN'
    OR EXISTS (
        SELECT 1 FROM public.opportunities o
        WHERE o.id = applications.opportunity_id
          AND is_org_member(o.organization_id)
    )
);

DROP POLICY IF EXISTS "applications_insert_student" ON public.applications;
CREATE POLICY "applications_insert_student" ON public.applications
FOR INSERT WITH CHECK (
    student_profile_id = (SELECT auth.uid())
    AND EXISTS (
        SELECT 1 FROM public.opportunities o
        WHERE o.id = applications.opportunity_id
          AND o.status = 'PUBLISHED'
          AND o.deleted_at IS NULL
    )
);

DROP POLICY IF EXISTS "applications_update_student_withdraw" ON public.applications;
CREATE POLICY "applications_update_student_withdraw" ON public.applications
FOR UPDATE USING (
    student_profile_id = (SELECT auth.uid())
    AND status NOT IN ('REJECTED', 'ACCEPTED', 'WITHDRAWN')
)
WITH CHECK (
    student_profile_id = (SELECT auth.uid())
    AND status = 'WITHDRAWN'
);

DROP POLICY IF EXISTS "applications_update_org_admin" ON public.applications;
CREATE POLICY "applications_update_org_admin" ON public.applications
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.opportunities o
        WHERE o.id = applications.opportunity_id
          AND is_org_member(o.organization_id)
    )
    OR (SELECT auth_user_role()) = 'ADMIN'
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.opportunities o
        WHERE o.id = applications.opportunity_id
          AND is_org_member(o.organization_id)
    )
    OR (SELECT auth_user_role()) = 'ADMIN'
);

-- Table: notifications
DROP POLICY IF EXISTS "notifications_manage_recipient" ON public.notifications;
CREATE POLICY "notifications_manage_recipient" ON public.notifications
FOR ALL USING (user_id = (SELECT auth.uid()));

-- Table: reports
DROP POLICY IF EXISTS "reports_select" ON public.reports;
CREATE POLICY "reports_select" ON public.reports
FOR SELECT USING (
    reporter_id = (SELECT auth.uid()) OR (SELECT auth_user_role()) = 'ADMIN'
);

DROP POLICY IF EXISTS "reports_insert_user" ON public.reports;
CREATE POLICY "reports_insert_user" ON public.reports
FOR INSERT WITH CHECK (
    reporter_id = (SELECT auth.uid())
);

DROP POLICY IF EXISTS "reports_admin_update" ON public.reports;
CREATE POLICY "reports_admin_update" ON public.reports
FOR UPDATE USING (
    (SELECT auth_user_role()) = 'ADMIN'
);
