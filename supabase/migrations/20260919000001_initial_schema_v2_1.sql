-- ============================================================================
-- CAMPUS OPPORTUNITY HUB — PHYSICAL DATABASE SCHEMA (PostgreSQL / Supabase)
-- Revision: v2.1 (Hardened Physical Implementation & Security Remediation)
-- Author: APEX Hackathon Architecture Team
-- ============================================================================

-- Ensure required cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. ENUMERATED TYPES (ENUMs)
-- ============================================================================

CREATE TYPE user_role AS ENUM (
    'STUDENT',
    'ORGANIZATION',
    'ADMIN'
);

CREATE TYPE org_verification_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'SUSPENDED'
);

CREATE TYPE opportunity_type AS ENUM (
    'INTERNSHIP',
    'JOB',
    'SCHOLARSHIP',
    'HACKATHON',
    'COMPETITION',
    'TRAINING',
    'VOLUNTEER',
    'FELLOWSHIP',
    'OTHER'
);

CREATE TYPE opportunity_status AS ENUM (
    'DRAFT',
    'PENDING_APPROVAL',
    'PUBLISHED',
    'CLOSED',
    'REJECTED'
);

CREATE TYPE application_status AS ENUM (
    'SUBMITTED',
    'UNDER_REVIEW',
    'SHORTLISTED',
    'REJECTED',
    'ACCEPTED',
    'WITHDRAWN'
);

CREATE TYPE skill_requirement_level AS ENUM (
    'REQUIRED',
    'PREFERRED'
);

CREATE TYPE experience_type AS ENUM (
    'INTERNSHIP',
    'JOB',
    'VOLUNTEER',
    'PROJECT',
    'RESEARCH',
    'OTHER'
);

CREATE TYPE assessment_status AS ENUM (
    'DRAFT',
    'ACTIVE',
    'CLOSED'
);

CREATE TYPE assessment_question_type AS ENUM (
    'TEXT',
    'MULTIPLE_CHOICE'
);

CREATE TYPE assessment_attempt_status AS ENUM (
    'NOT_STARTED',
    'IN_PROGRESS',
    'SUBMITTED'
);

CREATE TYPE report_reason AS ENUM (
    'SPAM',
    'SCAM_OR_FRAUD',
    'INAPPROPRIATE_CONTENT',
    'HARASSMENT',
    'MISLEADING',
    'OTHER'
);

CREATE TYPE report_status AS ENUM (
    'PENDING',
    'UNDER_REVIEW',
    'RESOLVED',
    'DISMISSED'
);

-- ============================================================================
-- 2. AUTOMATIC TIMESTAMP TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

-- ============================================================================
-- 3. CORE IDENTITY TABLES
-- ============================================================================

-- 1. users
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    middle_name TEXT NULL,
    last_name TEXT NOT NULL,
    role user_role NOT NULL,
    avatar_url TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ NULL,
    CONSTRAINT chk_users_first_name CHECK (length(trim(first_name)) > 0),
    CONSTRAINT chk_users_last_name CHECK (length(trim(last_name)) > 0)
);

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE INDEX idx_users_role ON users (role);

-- Helper functions for RLS (Declared early for triggers and policies)
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS user_role AS $$
    SELECT role FROM users WHERE id = auth.uid() AND deleted_at IS NULL;
$$ LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

-- Security Trigger: Prevent unauthorized role or identity changes on users table
CREATE OR REPLACE FUNCTION fn_protect_user_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent altering primary identity UUID
    IF NEW.id <> OLD.id THEN
        RAISE EXCEPTION 'User account identifier cannot be altered.';
    END IF;

    -- Privilege escalation guard: only administrators can alter user roles
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        IF auth_user_role() <> 'ADMIN' THEN
            RAISE EXCEPTION 'Unauthorized: Only platform administrators can change user roles.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

CREATE TRIGGER trg_users_protect_role
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION fn_protect_user_role();

-- 2. student_profiles
CREATE TABLE student_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    academic_year INTEGER NOT NULL,
    university TEXT NOT NULL,
    field_of_study TEXT NOT NULL,
    location TEXT NULL,
    career_goals TEXT NULL,
    career_goal_tags TEXT[] NOT NULL DEFAULT '{}',
    interests TEXT[] NOT NULL DEFAULT '{}',
    is_discoverable BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_student_academic_year CHECK (academic_year BETWEEN 1 AND 6),
    CONSTRAINT chk_student_university CHECK (length(trim(university)) > 0),
    CONSTRAINT chk_student_field_of_study CHECK (length(trim(field_of_study)) > 0)
);

CREATE TRIGGER trg_student_profiles_updated_at
BEFORE UPDATE ON student_profiles
FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE INDEX idx_student_profiles_discovery ON student_profiles (is_discoverable, academic_year) WHERE is_discoverable = true;
CREATE INDEX idx_student_profiles_interests_gin ON student_profiles USING GIN (interests);
CREATE INDEX idx_student_profiles_goal_tags_gin ON student_profiles USING GIN (career_goal_tags);

-- 3. skills (Master Catalog)
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_skills_name CHECK (length(trim(name)) > 0),
    CONSTRAINT chk_skills_category CHECK (length(trim(category)) > 0)
);

CREATE UNIQUE INDEX uq_skills_lower_name ON skills (lower(trim(name)));
CREATE INDEX idx_skills_category ON skills (category);

-- 4. student_skills (Junction)
CREATE TABLE student_skills (
    student_profile_id UUID NOT NULL REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
    proficiency INTEGER NOT NULL,
    years_of_experience NUMERIC(3,1) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (student_profile_id, skill_id),
    CONSTRAINT chk_student_skills_proficiency CHECK (proficiency BETWEEN 1 AND 5),
    CONSTRAINT chk_student_skills_years CHECK (years_of_experience IS NULL OR years_of_experience >= 0.0)
);

CREATE INDEX idx_student_skills_skill_id ON student_skills (skill_id);

-- 5. experiences
CREATE TABLE experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_profile_id UUID NOT NULL REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    organization_name TEXT NOT NULL,
    experience_type experience_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL,
    location TEXT NULL,
    description TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_experience_dates CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT chk_experience_title CHECK (length(trim(title)) > 0),
    CONSTRAINT chk_experience_org_name CHECK (length(trim(organization_name)) > 0)
);

CREATE TRIGGER trg_experiences_updated_at
BEFORE UPDATE ON experiences
FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE INDEX idx_experiences_student ON experiences (student_profile_id, start_date DESC);

-- 6. cvs
CREATE TABLE cvs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_profile_id UUID NOT NULL REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_cvs_file_size CHECK (file_size > 0 AND file_size <= 10485760),
    CONSTRAINT chk_cvs_file_name CHECK (length(trim(file_name)) > 0),
    CONSTRAINT chk_cvs_file_path CHECK (length(trim(file_path)) > 0)
);

-- Enforce at most one default CV per student
CREATE UNIQUE INDEX uq_cvs_single_default_per_student 
ON cvs (student_profile_id) 
WHERE is_default = true;

CREATE INDEX idx_cvs_student ON cvs (student_profile_id);

-- 7. organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT NULL,
    website_url TEXT NULL,
    contact_email TEXT NULL,
    contact_phone TEXT NULL,
    verification_status org_verification_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ NULL,
    CONSTRAINT chk_org_name CHECK (length(trim(name)) > 0),
    CONSTRAINT chk_org_description CHECK (description IS NULL OR length(description) <= 2000),
    CONSTRAINT chk_org_email CHECK (contact_email IS NULL OR contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TRIGGER trg_organizations_updated_at
BEFORE UPDATE ON organizations
FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE INDEX idx_organizations_verification ON organizations (verification_status) WHERE deleted_at IS NULL;

-- 8. organization_members (Junction)
CREATE TABLE organization_members (
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (organization_id, user_id),
    -- MVP Rule: strictly one member per organization
    CONSTRAINT uq_org_members_single_member_mvp UNIQUE (organization_id)
);

CREATE INDEX idx_org_members_user_id ON organization_members (user_id);

-- Helper function: Check if user is member of organization
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_id = org_id AND user_id = auth.uid()
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

-- ============================================================================
-- 4. OPPORTUNITIES & APPLICATIONS
-- ============================================================================

-- 9. opportunities
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    opportunity_type opportunity_type NOT NULL,
    status opportunity_status NOT NULL DEFAULT 'DRAFT',
    location TEXT NULL,
    is_remote BOOLEAN NOT NULL DEFAULT false,
    application_deadline TIMESTAMPTZ NULL,
    minimum_academic_year INTEGER NULL,
    maximum_academic_year INTEGER NULL,
    minimum_gpa NUMERIC(3,2) NULL,
    eligible_fields TEXT[] NOT NULL DEFAULT '{}',
    compensation TEXT NULL,
    application_url TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at TIMESTAMPTZ NULL,
    deleted_at TIMESTAMPTZ NULL,
    CONSTRAINT chk_opportunities_title_len CHECK (length(trim(title)) > 0 AND length(title) <= 200),
    CONSTRAINT chk_opportunities_desc_len CHECK (length(trim(description)) > 0 AND length(description) <= 10000),
    CONSTRAINT chk_opportunities_year_min CHECK (minimum_academic_year IS NULL OR minimum_academic_year BETWEEN 1 AND 6),
    CONSTRAINT chk_opportunities_year_max CHECK (maximum_academic_year IS NULL OR maximum_academic_year BETWEEN 1 AND 6),
    CONSTRAINT chk_opportunities_year_range CHECK (minimum_academic_year IS NULL OR maximum_academic_year IS NULL OR minimum_academic_year <= maximum_academic_year),
    CONSTRAINT chk_opportunities_gpa CHECK (minimum_gpa IS NULL OR (minimum_gpa >= 0.00 AND minimum_gpa <= 4.00))
);

CREATE TRIGGER trg_opportunities_updated_at
BEFORE UPDATE ON opportunities
FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE INDEX idx_opportunities_discovery ON opportunities (status, opportunity_type, application_deadline) WHERE deleted_at IS NULL;
CREATE INDEX idx_opportunities_org_status ON opportunities (organization_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_opportunities_eligible_fields_gin ON opportunities USING GIN (eligible_fields);

-- 10. opportunity_skills (Junction)
CREATE TABLE opportunity_skills (
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
    requirement_level skill_requirement_level NOT NULL DEFAULT 'REQUIRED',
    PRIMARY KEY (opportunity_id, skill_id)
);

CREATE INDEX idx_opp_skills_skill_id ON opportunity_skills (skill_id);

-- 11. saved_opportunities (Junction / Bookmarking)
CREATE TABLE saved_opportunities (
    student_profile_id UUID NOT NULL REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (student_profile_id, opportunity_id)
);

CREATE INDEX idx_saved_opps_student ON saved_opportunities (student_profile_id, saved_at DESC);

-- 12. applications (Junction / Recruitment Workflow)
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_profile_id UUID NOT NULL REFERENCES student_profiles(user_id) ON DELETE RESTRICT,
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE RESTRICT,
    status application_status NOT NULL DEFAULT 'SUBMITTED',
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_applications_student_opportunity UNIQUE (student_profile_id, opportunity_id)
);

CREATE TRIGGER trg_applications_updated_at
BEFORE UPDATE ON applications
FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE INDEX idx_applications_student_status ON applications (student_profile_id, status);
CREATE INDEX idx_applications_opp_status ON applications (opportunity_id, status);

-- ============================================================================
-- 5. ASSESSMENT PIPELINE
-- ============================================================================

-- 13. assessments
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    instructions TEXT NULL,
    time_limit_minutes INTEGER NULL,
    status assessment_status NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_assessments_opportunity_id UNIQUE (opportunity_id),
    CONSTRAINT chk_assessments_title CHECK (length(trim(title)) > 0 AND length(title) <= 200),
    CONSTRAINT chk_assessments_time_limit CHECK (time_limit_minutes IS NULL OR time_limit_minutes > 0)
);

CREATE TRIGGER trg_assessments_updated_at
BEFORE UPDATE ON assessments
FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

-- 14. assessment_questions
CREATE TABLE assessment_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type assessment_question_type NOT NULL,
    question_order INTEGER NOT NULL,
    is_ai_generated BOOLEAN NOT NULL DEFAULT false,
    options JSONB NULL,
    reference_answer TEXT NULL,
    evaluation_guidance TEXT NULL,
    requirement_level skill_requirement_level NOT NULL DEFAULT 'REQUIRED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_assessment_questions_order UNIQUE (assessment_id, question_order),
    CONSTRAINT uq_assessment_questions_id_assessment UNIQUE (id, assessment_id),
    CONSTRAINT chk_questions_order CHECK (question_order >= 1),
    CONSTRAINT chk_questions_text CHECK (length(trim(question_text)) > 0),
    CONSTRAINT chk_questions_mcq_options CHECK (
        (question_type = 'MULTIPLE_CHOICE' AND options IS NOT NULL) OR 
        (question_type = 'TEXT')
    )
);

CREATE TRIGGER trg_assessment_questions_updated_at
BEFORE UPDATE ON assessment_questions
FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

-- 15. assessment_attempts
CREATE TABLE assessment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE RESTRICT,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE RESTRICT,
    status assessment_attempt_status NOT NULL DEFAULT 'NOT_STARTED',
    started_at TIMESTAMPTZ NULL,
    submitted_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- MVP Rule: strictly one attempt per application (no retakes)
    CONSTRAINT uq_assessment_attempts_app UNIQUE (application_id),
    CONSTRAINT uq_assessment_attempts_id_assessment UNIQUE (id, assessment_id),
    CONSTRAINT chk_attempt_timestamps CHECK (
        submitted_at IS NULL OR started_at IS NULL OR submitted_at >= started_at
    )
);

CREATE TRIGGER trg_assessment_attempts_updated_at
BEFORE UPDATE ON assessment_attempts
FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE INDEX idx_attempts_assessment ON assessment_attempts (assessment_id, status);

-- Diamond 1 Validation Trigger: Attempt must reference matching Application and Assessment
CREATE OR REPLACE FUNCTION fn_validate_attempt_opportunity()
RETURNS TRIGGER AS $$
DECLARE
    v_app_opp_id UUID;
    v_asmt_opp_id UUID;
BEGIN
    SELECT opportunity_id INTO v_app_opp_id FROM applications WHERE id = NEW.application_id;
    SELECT opportunity_id INTO v_asmt_opp_id FROM assessments WHERE id = NEW.assessment_id;

    IF v_app_opp_id IS NULL OR v_asmt_opp_id IS NULL OR v_app_opp_id <> v_asmt_opp_id THEN
        RAISE EXCEPTION 'Diamond Integrity Violation: Application and Assessment must belong to the exact same Opportunity (app_opp: %, asmt_opp: %)',
            v_app_opp_id, v_asmt_opp_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

CREATE TRIGGER trg_validate_attempt_opportunity
BEFORE INSERT OR UPDATE ON assessment_attempts
FOR EACH ROW EXECUTE FUNCTION fn_validate_attempt_opportunity();

-- 16. assessment_answers
-- Diamond 2 Declarative Composite Foreign Key Architecture
CREATE TABLE assessment_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_attempt_id UUID NOT NULL,
    assessment_question_id UUID NOT NULL,
    assessment_id UUID NOT NULL,
    answer_text TEXT NOT NULL,
    answered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_answers_attempt_question UNIQUE (assessment_attempt_id, assessment_question_id),
    CONSTRAINT fk_answers_attempt_assessment 
        FOREIGN KEY (assessment_attempt_id, assessment_id) 
        REFERENCES assessment_attempts(id, assessment_id) ON DELETE CASCADE,
    CONSTRAINT fk_answers_question_assessment 
        FOREIGN KEY (assessment_question_id, assessment_id) 
        REFERENCES assessment_questions(id, assessment_id) ON DELETE RESTRICT
);

CREATE TRIGGER trg_assessment_answers_updated_at
BEFORE UPDATE ON assessment_answers
FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE INDEX idx_answers_attempt ON assessment_answers (assessment_attempt_id);
CREATE INDEX idx_answers_question ON assessment_answers (assessment_question_id);

-- 17. assessment_results
CREATE TABLE assessment_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_attempt_id UUID NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
    -- AI Advisory Provenance
    ai_score INTEGER NULL,
    ai_requirement_match TEXT NULL,
    ai_skill_analysis JSONB NULL,
    ai_strengths TEXT[] NULL,
    ai_gaps TEXT[] NULL,
    ai_summary TEXT NULL,
    ai_evaluated_at TIMESTAMPTZ NULL,
    -- Human Review & Override
    human_score INTEGER NULL,
    human_feedback TEXT NULL,
    human_evaluator_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    human_evaluated_at TIMESTAMPTZ NULL,
    -- Final Authoritative Result
    final_score INTEGER NOT NULL,
    final_summary TEXT NOT NULL,
    final_strengths TEXT[] NOT NULL DEFAULT '{}',
    final_gaps TEXT[] NOT NULL DEFAULT '{}',
    is_final_approved BOOLEAN NOT NULL DEFAULT false,
    approved_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_assessment_results_attempt UNIQUE (assessment_attempt_id),
    CONSTRAINT chk_results_ai_score CHECK (ai_score IS NULL OR (ai_score BETWEEN 0 AND 100)),
    CONSTRAINT chk_results_human_score CHECK (human_score IS NULL OR (human_score BETWEEN 0 AND 100)),
    CONSTRAINT chk_results_final_score CHECK (final_score BETWEEN 0 AND 100)
);

CREATE TRIGGER trg_assessment_results_updated_at
BEFORE UPDATE ON assessment_results
FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

-- ============================================================================
-- 6. NOTIFICATIONS & PLATFORM MODERATION
-- ============================================================================

-- 18. notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_notifications_title CHECK (length(trim(title)) > 0),
    CONSTRAINT chk_notifications_content CHECK (length(trim(content)) > 0)
);

CREATE INDEX idx_notifications_user_unread ON notifications (user_id, created_at DESC) WHERE is_read = false;

-- 19. reports
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reported_opportunity_id UUID NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    reported_organization_id UUID NULL REFERENCES organizations(id) ON DELETE CASCADE,
    reported_user_id UUID NULL REFERENCES users(id) ON DELETE CASCADE,
    reason report_reason NOT NULL,
    description TEXT NOT NULL,
    status report_status NOT NULL DEFAULT 'PENDING',
    admin_notes TEXT NULL,
    resolved_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Invariant: Exactly ONE target must be specified
    CONSTRAINT chk_reports_exclusive_target CHECK (
        num_nonnulls(reported_opportunity_id, reported_organization_id, reported_user_id) = 1
    ),
    CONSTRAINT chk_reports_description CHECK (length(trim(description)) > 0)
);

CREATE TRIGGER trg_reports_updated_at
BEFORE UPDATE ON reports
FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE INDEX idx_reports_pending_status ON reports (status, created_at) WHERE status = 'PENDING';
CREATE INDEX idx_reports_reporter_id ON reports (reporter_id);
CREATE INDEX idx_reports_target_opp ON reports (reported_opportunity_id) WHERE reported_opportunity_id IS NOT NULL;
CREATE INDEX idx_reports_target_org ON reports (reported_organization_id) WHERE reported_organization_id IS NOT NULL;
CREATE INDEX idx_reports_target_usr ON reports (reported_user_id) WHERE reported_user_id IS NOT NULL;

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS across all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- Table: users
-- ----------------------------------------------------------------------------
-- SELECT: Users can view self, Admins can view all, Organizations can view discoverable students and active applicants
CREATE POLICY "users_select" ON users
FOR SELECT USING (
    id = auth.uid()
    OR auth_user_role() = 'ADMIN'
    OR EXISTS (
        SELECT 1 FROM student_profiles sp
        WHERE sp.user_id = users.id
          AND sp.is_discoverable = true
    )
    OR EXISTS (
        SELECT 1 FROM applications a
        JOIN opportunities o ON a.opportunity_id = o.id
        WHERE a.student_profile_id = users.id
          AND is_org_member(o.organization_id)
    )
);

-- INSERT: Authenticated user can create their own application user record matching their auth identifier
CREATE POLICY "users_insert_self" ON users
FOR INSERT WITH CHECK (
    id = auth.uid()
);

-- UPDATE: Self update permitted (role changes prevented by trg_users_protect_role)
CREATE POLICY "users_update_self" ON users
FOR UPDATE USING (
    id = auth.uid() OR auth_user_role() = 'ADMIN'
)
WITH CHECK (
    id = auth.uid() OR auth_user_role() = 'ADMIN'
);

-- ----------------------------------------------------------------------------
-- Table: student_profiles
-- ----------------------------------------------------------------------------
CREATE POLICY "student_profiles_select" ON student_profiles
FOR SELECT USING (
    user_id = auth.uid()
    OR auth_user_role() = 'ADMIN'
    OR is_discoverable = true
    OR EXISTS (
        SELECT 1 FROM applications a
        JOIN opportunities o ON a.opportunity_id = o.id
        WHERE a.student_profile_id = student_profiles.user_id
          AND is_org_member(o.organization_id)
    )
);

CREATE POLICY "student_profiles_insert_own" ON student_profiles
FOR INSERT WITH CHECK (
    user_id = auth.uid() AND auth_user_role() = 'STUDENT'
);

CREATE POLICY "student_profiles_update_own" ON student_profiles
FOR UPDATE USING (
    user_id = auth.uid() OR auth_user_role() = 'ADMIN'
);

-- ----------------------------------------------------------------------------
-- Table: skills
-- ----------------------------------------------------------------------------
CREATE POLICY "skills_select_all" ON skills
FOR SELECT USING (true);

CREATE POLICY "skills_admin_manage" ON skills
FOR ALL USING (auth_user_role() = 'ADMIN');

-- ----------------------------------------------------------------------------
-- Table: student_skills
-- ----------------------------------------------------------------------------
CREATE POLICY "student_skills_select" ON student_skills
FOR SELECT USING (
    student_profile_id = auth.uid()
    OR auth_user_role() = 'ADMIN'
    OR EXISTS (
        SELECT 1 FROM student_profiles sp
        WHERE sp.user_id = student_skills.student_profile_id
          AND (sp.is_discoverable = true OR EXISTS (
              SELECT 1 FROM applications a
              JOIN opportunities o ON a.opportunity_id = o.id
              WHERE a.student_profile_id = sp.user_id
                AND is_org_member(o.organization_id)
          ))
    )
);

CREATE POLICY "student_skills_manage_own" ON student_skills
FOR ALL USING (
    student_profile_id = auth.uid() OR auth_user_role() = 'ADMIN'
);

-- ----------------------------------------------------------------------------
-- Table: experiences
-- ----------------------------------------------------------------------------
CREATE POLICY "experiences_select" ON experiences
FOR SELECT USING (
    student_profile_id = auth.uid()
    OR auth_user_role() = 'ADMIN'
    OR EXISTS (
        SELECT 1 FROM student_profiles sp
        WHERE sp.user_id = experiences.student_profile_id
          AND (sp.is_discoverable = true OR EXISTS (
              SELECT 1 FROM applications a
              JOIN opportunities o ON a.opportunity_id = o.id
              WHERE a.student_profile_id = sp.user_id
                AND is_org_member(o.organization_id)
          ))
    )
);

CREATE POLICY "experiences_manage_own" ON experiences
FOR ALL USING (
    student_profile_id = auth.uid() OR auth_user_role() = 'ADMIN'
);

-- ----------------------------------------------------------------------------
-- Table: cvs (Private: Talent Discovery Blocked)
-- ----------------------------------------------------------------------------
CREATE POLICY "cvs_select" ON cvs
FOR SELECT USING (
    student_profile_id = auth.uid()
    OR auth_user_role() = 'ADMIN'
    OR EXISTS (
        SELECT 1 FROM applications a
        JOIN opportunities o ON a.opportunity_id = o.id
        WHERE a.student_profile_id = cvs.student_profile_id
          AND is_org_member(o.organization_id)
    )
);

CREATE POLICY "cvs_manage_own" ON cvs
FOR ALL USING (
    student_profile_id = auth.uid() OR auth_user_role() = 'ADMIN'
);

-- ----------------------------------------------------------------------------
-- Table: organizations
-- ----------------------------------------------------------------------------
CREATE POLICY "organizations_select" ON organizations
FOR SELECT USING (
    (verification_status = 'APPROVED' AND deleted_at IS NULL)
    OR is_org_member(id)
    OR auth_user_role() = 'ADMIN'
);

CREATE POLICY "organizations_insert" ON organizations
FOR INSERT WITH CHECK (
    auth_user_role() IN ('ORGANIZATION', 'ADMIN')
);

CREATE POLICY "organizations_update_member" ON organizations
FOR UPDATE USING (
    is_org_member(id) OR auth_user_role() = 'ADMIN'
);

CREATE POLICY "organizations_admin_manage" ON organizations
FOR ALL USING (auth_user_role() = 'ADMIN');

-- ----------------------------------------------------------------------------
-- Table: organization_members
-- ----------------------------------------------------------------------------
CREATE POLICY "org_members_select" ON organization_members
FOR SELECT USING (
    user_id = auth.uid() OR auth_user_role() = 'ADMIN'
);

CREATE POLICY "org_members_insert" ON organization_members
FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND auth_user_role() IN ('ORGANIZATION', 'ADMIN')
);

-- ----------------------------------------------------------------------------
-- Table: opportunities
-- ----------------------------------------------------------------------------
CREATE POLICY "opportunities_select" ON opportunities
FOR SELECT USING (
    (status = 'PUBLISHED' AND deleted_at IS NULL)
    OR is_org_member(organization_id)
    OR auth_user_role() = 'ADMIN'
);

-- INSERT: Organization members can create DRAFTs anytime; publishing requires APPROVED status
CREATE POLICY "opportunities_insert_member" ON opportunities
FOR INSERT WITH CHECK (
    (is_org_member(organization_id) OR auth_user_role() = 'ADMIN')
    AND (
        status = 'DRAFT'
        OR (
            status = 'PUBLISHED'
            AND EXISTS (
                SELECT 1 FROM organizations
                WHERE id = opportunities.organization_id
                  AND verification_status = 'APPROVED'
                  AND deleted_at IS NULL
            )
        )
    )
);

-- UPDATE: Updating drafts permitted; transitioning to PUBLISHED requires APPROVED organization
CREATE POLICY "opportunities_update_member" ON opportunities
FOR UPDATE USING (
    is_org_member(organization_id) OR auth_user_role() = 'ADMIN'
)
WITH CHECK (
    (is_org_member(organization_id) OR auth_user_role() = 'ADMIN')
    AND (
        status <> 'PUBLISHED'
        OR EXISTS (
            SELECT 1 FROM organizations
            WHERE id = opportunities.organization_id
              AND verification_status = 'APPROVED'
              AND deleted_at IS NULL
        )
    )
);

CREATE POLICY "opportunities_delete_member" ON opportunities
FOR DELETE USING (
    is_org_member(organization_id) OR auth_user_role() = 'ADMIN'
);

-- ----------------------------------------------------------------------------
-- Table: opportunity_skills
-- ----------------------------------------------------------------------------
CREATE POLICY "opp_skills_select" ON opportunity_skills
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM opportunities o
        WHERE o.id = opportunity_skills.opportunity_id
          AND (o.status = 'PUBLISHED' OR is_org_member(o.organization_id) OR auth_user_role() = 'ADMIN')
    )
);

CREATE POLICY "opp_skills_manage_member" ON opportunity_skills
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM opportunities o
        WHERE o.id = opportunity_skills.opportunity_id
          AND (is_org_member(o.organization_id) OR auth_user_role() = 'ADMIN')
    )
);

-- ----------------------------------------------------------------------------
-- Table: saved_opportunities (Private Student Bookmarks)
-- ----------------------------------------------------------------------------
CREATE POLICY "saved_opps_manage_own" ON saved_opportunities
FOR ALL USING (student_profile_id = auth.uid());

-- ----------------------------------------------------------------------------
-- Table: applications
-- ----------------------------------------------------------------------------
CREATE POLICY "applications_select" ON applications
FOR SELECT USING (
    student_profile_id = auth.uid()
    OR auth_user_role() = 'ADMIN'
    OR EXISTS (
        SELECT 1 FROM opportunities o
        WHERE o.id = applications.opportunity_id
          AND is_org_member(o.organization_id)
    )
);

CREATE POLICY "applications_insert_student" ON applications
FOR INSERT WITH CHECK (
    student_profile_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM opportunities o
        WHERE o.id = applications.opportunity_id
          AND o.status = 'PUBLISHED'
          AND o.deleted_at IS NULL
    )
);

-- Student application withdrawal policy
CREATE POLICY "applications_update_student_withdraw" ON applications
FOR UPDATE USING (
    student_profile_id = auth.uid()
    AND status NOT IN ('REJECTED', 'ACCEPTED', 'WITHDRAWN')
)
WITH CHECK (
    student_profile_id = auth.uid()
    AND status = 'WITHDRAWN'
);

-- Organization & Admin review status management policy
CREATE POLICY "applications_update_org_admin" ON applications
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM opportunities o
        WHERE o.id = applications.opportunity_id
          AND is_org_member(o.organization_id)
    )
    OR auth_user_role() = 'ADMIN'
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM opportunities o
        WHERE o.id = applications.opportunity_id
          AND is_org_member(o.organization_id)
    )
    OR auth_user_role() = 'ADMIN'
);

-- ----------------------------------------------------------------------------
-- Table: assessments
-- ----------------------------------------------------------------------------
CREATE POLICY "assessments_select" ON assessments
FOR SELECT USING (
    is_org_member(
        (SELECT organization_id FROM opportunities WHERE id = assessments.opportunity_id)
    )
    OR auth_user_role() = 'ADMIN'
    OR EXISTS (
        SELECT 1 FROM applications a
        WHERE a.opportunity_id = assessments.opportunity_id
          AND a.student_profile_id = auth.uid()
    )
);

CREATE POLICY "assessments_manage_org" ON assessments
FOR ALL USING (
    is_org_member(
        (SELECT organization_id FROM opportunities WHERE id = assessments.opportunity_id)
    )
    OR auth_user_role() = 'ADMIN'
);

-- ----------------------------------------------------------------------------
-- Table: assessment_questions
-- Secure Base Table: Accessible exclusively to Organization Representatives and Administrators
-- ----------------------------------------------------------------------------
CREATE POLICY "assessment_questions_select_org_admin" ON assessment_questions
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM assessments a
        JOIN opportunities o ON a.opportunity_id = o.id
        WHERE a.id = assessment_questions.assessment_id
          AND (is_org_member(o.organization_id) OR auth_user_role() = 'ADMIN')
    )
);

CREATE POLICY "assessment_questions_manage_org" ON assessment_questions
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM assessments a
        JOIN opportunities o ON a.opportunity_id = o.id
        WHERE a.id = assessment_questions.assessment_id
          AND (is_org_member(o.organization_id) OR auth_user_role() = 'ADMIN')
    )
);

-- ============================================================================
-- 8. CANDIDATE-FACING SECURE QUESTION VIEW (Protects Answer Keys & Rubrics)
-- ============================================================================
-- Candidates query this view during active attempts.
-- reference_answer and evaluation_guidance are permanently excluded from the view projection.
CREATE OR REPLACE VIEW candidate_assessment_questions AS
SELECT 
    q.id,
    q.assessment_id,
    q.question_text,
    q.question_type,
    q.question_order,
    q.options,
    q.requirement_level
FROM assessment_questions q
WHERE EXISTS (
    SELECT 1 FROM assessment_attempts att
    JOIN applications a ON att.application_id = a.id
    WHERE att.assessment_id = q.assessment_id
      AND a.student_profile_id = auth.uid()
);

-- ----------------------------------------------------------------------------
-- Table: assessment_attempts
-- ----------------------------------------------------------------------------
CREATE POLICY "assessment_attempts_select" ON assessment_attempts
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM applications a
        WHERE a.id = assessment_attempts.application_id
          AND a.student_profile_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM applications a
        JOIN opportunities o ON a.opportunity_id = o.id
        WHERE a.id = assessment_attempts.application_id
          AND is_org_member(o.organization_id)
    )
    OR auth_user_role() = 'ADMIN'
);

CREATE POLICY "assessment_attempts_insert_student" ON assessment_attempts
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM applications a
        WHERE a.id = assessment_attempts.application_id
          AND a.student_profile_id = auth.uid()
    )
);

CREATE POLICY "assessment_attempts_update_student" ON assessment_attempts
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM applications a
        WHERE a.id = assessment_attempts.application_id
          AND a.student_profile_id = auth.uid()
    )
);

-- ----------------------------------------------------------------------------
-- Table: assessment_answers
-- ----------------------------------------------------------------------------
CREATE POLICY "assessment_answers_select" ON assessment_answers
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM assessment_attempts att
        JOIN applications a ON att.application_id = a.id
        WHERE att.id = assessment_answers.assessment_attempt_id
          AND a.student_profile_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM assessment_attempts att
        JOIN applications a ON att.application_id = a.id
        JOIN opportunities o ON a.opportunity_id = o.id
        WHERE att.id = assessment_answers.assessment_attempt_id
          AND is_org_member(o.organization_id)
    )
    OR auth_user_role() = 'ADMIN'
);

CREATE POLICY "assessment_answers_manage_student" ON assessment_answers
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM assessment_attempts att
        JOIN applications a ON att.application_id = a.id
        WHERE att.id = assessment_answers.assessment_attempt_id
          AND a.student_profile_id = auth.uid()
          AND att.status = 'IN_PROGRESS'
    )
);

-- ----------------------------------------------------------------------------
-- Table: assessment_results (Advisory Results: Recruiter & Admin Access)
-- ----------------------------------------------------------------------------
CREATE POLICY "assessment_results_select" ON assessment_results
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM assessment_attempts att
        JOIN applications a ON att.application_id = a.id
        JOIN opportunities o ON a.opportunity_id = o.id
        WHERE att.id = assessment_results.assessment_attempt_id
          AND is_org_member(o.organization_id)
    )
    OR auth_user_role() = 'ADMIN'
);

CREATE POLICY "assessment_results_insert_org" ON assessment_results
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM assessment_attempts att
        JOIN applications a ON att.application_id = a.id
        JOIN opportunities o ON a.opportunity_id = o.id
        WHERE att.id = assessment_results.assessment_attempt_id
          AND (is_org_member(o.organization_id) OR auth_user_role() = 'ADMIN')
    )
);

CREATE POLICY "assessment_results_update_org" ON assessment_results
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM assessment_attempts att
        JOIN applications a ON att.application_id = a.id
        JOIN opportunities o ON a.opportunity_id = o.id
        WHERE att.id = assessment_results.assessment_attempt_id
          AND (is_org_member(o.organization_id) OR auth_user_role() = 'ADMIN')
    )
);

-- ----------------------------------------------------------------------------
-- Table: notifications
-- ----------------------------------------------------------------------------
CREATE POLICY "notifications_manage_recipient" ON notifications
FOR ALL USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- Table: reports
-- ----------------------------------------------------------------------------
CREATE POLICY "reports_select" ON reports
FOR SELECT USING (
    reporter_id = auth.uid() OR auth_user_role() = 'ADMIN'
);

CREATE POLICY "reports_insert_user" ON reports
FOR INSERT WITH CHECK (
    reporter_id = auth.uid()
);

CREATE POLICY "reports_admin_update" ON reports
FOR UPDATE USING (
    auth_user_role() = 'ADMIN'
);
