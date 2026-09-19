# Campus Opportunity Hub
## Physical PostgreSQL Database Model & Schema Specification
### Day 2 Deliverable — Supabase PostgreSQL Production Specification

---

## 1. Executive Summary & Physical Architecture

This document defines the **Physical PostgreSQL Database Model** for the **Campus Opportunity Hub**, a centralized platform engineered by the **APEX Hackathon Team** connecting higher education students with professional and academic opportunities (internships, jobs, scholarships, hackathons, competitions, training, volunteer roles, and fellowships).

The platform architecture integrates:
- **Client Application**: React single-page application with TypeScript.
- **Data & Security Layer**: Supabase PostgreSQL 15+ with native Row Level Security (RLS).
- **Authentication**: Supabase Auth (`auth.users`) decoupled from application profile data.
- **Object Storage**: Supabase Storage for student CV artifacts.
- **Compute / AI Services**: Supabase Edge Functions / Backend services for AI-assisted question generation, resume parsing, and applicant evaluation.

> [!NOTE]
> **Shared Project Database Schema**  
> **Primary Implementation Responsibility:** Backend 2  
> This specification documents the finalized physical database schema developed for the Campus Opportunity Hub platform. The schema serves as the unified data and security foundation for all APEX backend services and frontend applications.

### Core Architectural Decisions & Invariants
1. **Primary Keys**: Every table utilizes `UUID` identifiers generated via `gen_random_uuid()` (or inherited from `auth.users` for 1:1 user extensions). Auto-incrementing integers are strictly prohibited.
2. **Naming Standard**: Strict PostgreSQL `snake_case` for tables, columns, constraints, and indexes. Frontend TypeScript maps these to `camelCase`.
3. **Temporal Types**: Exact timeline events utilize `TIMESTAMPTZ` with timezone awareness (stored in UTC). Calendar boundaries without time-of-day utilize `DATE`. Creation timestamps default to `now()`.
4. **Automated Modification Tracking**: Tables maintaining mutable state implement an automated `updated_at` trigger function (`fn_update_timestamp()`).
5. **Controlled States**: Controlled lifecycle states, roles, and taxonomies are enforced using 12 native PostgreSQL `ENUM` types.
6. **Selective Soft Deletion**: Soft deletion via `deleted_at TIMESTAMPTZ NULL` is restricted strictly to root business entities (`users`, `organizations`, `opportunities`). Child entities, bookmarks, and evaluation records use parent lifecycle cascades or hard deletion.
7. **Referential Integrity & Delete Safety**: Historically critical records (`applications`, `assessment_attempts`, `reports`) utilize `ON DELETE RESTRICT` to prevent accidental cascades. Tightly coupled dependent records (`student_skills`, `opportunity_skills`, `saved_opportunities`, `assessment_answers`) utilize `ON DELETE CASCADE`.
8. **Declarative Diamond Integrity**: Cross-table diamond dependencies across assessments, questions, attempts, and answers are enforced declaratively via composite foreign keys `(id, assessment_id)`.
9. **Student Discoverability & Multi-Tier Privacy**: Student profiles feature an `is_discoverable BOOLEAN NOT NULL DEFAULT true` toggle. Organizations may browse discoverable public talent profiles, but access to private contact details, CV documents, and assessment interactions is strictly restricted to active applicants through opportunity-scoped RLS policies.
10. **Human-in-the-Loop AI Provenance**: Assessment results distinctly preserve AI advisory scores/rubrics, human recruiter overrides, and final approved evaluations without destructive overwrites.

---

## 2. PostgreSQL Enumerated Types (ENUMs)

```sql
-- 1. User platform role
CREATE TYPE user_role AS ENUM (
    'STUDENT',
    'ORGANIZATION',
    'ADMIN'
);

-- 2. Organization institutional verification status
CREATE TYPE org_verification_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'SUSPENDED'
);

-- 3. Opportunity category
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

-- 4. Opportunity publication lifecycle
CREATE TYPE opportunity_status AS ENUM (
    'DRAFT',
    'PENDING_APPROVAL',
    'PUBLISHED',
    'CLOSED',
    'REJECTED'
);

-- 5. Student application progression
CREATE TYPE application_status AS ENUM (
    'SUBMITTED',
    'UNDER_REVIEW',
    'SHORTLISTED',
    'REJECTED',
    'ACCEPTED',
    'WITHDRAWN'
);

-- 6. Skill and Question requirement tier
CREATE TYPE skill_requirement_level AS ENUM (
    'REQUIRED',
    'PREFERRED'
);

-- 7. Experience classification
CREATE TYPE experience_type AS ENUM (
    'INTERNSHIP',
    'JOB',
    'VOLUNTEER',
    'PROJECT',
    'RESEARCH',
    'OTHER'
);

-- 8. Assessment lifecycle state
CREATE TYPE assessment_status AS ENUM (
    'DRAFT',
    'ACTIVE',
    'CLOSED'
);

-- 9. Assessment question format
CREATE TYPE assessment_question_type AS ENUM (
    'TEXT',
    'MULTIPLE_CHOICE'
);

-- 10. Candidate assessment attempt status
CREATE TYPE assessment_attempt_status AS ENUM (
    'NOT_STARTED',
    'IN_PROGRESS',
    'SUBMITTED'
);

-- 11. Platform abuse report category
CREATE TYPE report_reason AS ENUM (
    'SPAM',
    'SCAM_OR_FRAUD',
    'INAPPROPRIATE_CONTENT',
    'HARASSMENT',
    'MISLEADING',
    'OTHER'
);

-- 12. Report adjudication state
CREATE TYPE report_status AS ENUM (
    'PENDING',
    'UNDER_REVIEW',
    'RESOLVED',
    'DISMISSED'
);
```

---

## 3. Physical Schema Specification (Table by Table)

The physical model maps the 19 approved logical entities into 19 normalized relational tables:

```text
Identity & Access:
  1. users
  2. student_profiles
  3. organizations
  4. organization_members

Profiles & Portfolios:
  5. skills
  6. student_skills
  7. experiences
  8. cvs

Opportunity & Application Engine:
  9. opportunities
  10. opportunity_skills
  11. saved_opportunities
  12. applications

Assessment Pipeline:
  13. assessments
  14. assessment_questions
  15. assessment_attempts
  16. assessment_answers
  17. assessment_results

Platform Support & Governance:
  18. notifications
  19. reports
```

---

### 3.1 Table: `users`
- **Purpose**: Application-level identity, persona classification, and account state. Maps 1:1 with Supabase Auth (`auth.users`).
- **Physical Columns**:

| Column Name | PostgreSQL Data Type | Nullable | Default | PK / FK / Reference | Constraints & Rules |
|---|---|---|---|---|---|
| `id` | `UUID` | NOT NULL | — | **PK**, FK $\to$ `auth.users(id)` | Cascades on `auth.users` deletion |
| `first_name` | `TEXT` | NOT NULL | — | — | `CHECK (length(trim(first_name)) > 0)` |
| `middle_name` | `TEXT` | NULL | NULL | — | Optional |
| `last_name` | `TEXT` | NOT NULL | — | — | `CHECK (length(trim(last_name)) > 0)` |
| `role` | `user_role` | NOT NULL | — | — | Controlled persona role |
| `avatar_url` | `TEXT` | NULL | NULL | — | Public storage URI |
| `is_active` | `BOOLEAN` | NOT NULL | `true` | — | Administrative lock flag |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Account creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Maintained via trigger |
| `deleted_at` | `TIMESTAMPTZ` | NULL | NULL | — | Soft deletion timestamp |

- **Foreign Keys**:
  - `FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE`
- **Unique Constraints**:
  - Primary Key on `id`
- **Check Constraints**:
  - `chk_users_first_name`: `length(trim(first_name)) > 0`
  - `chk_users_last_name`: `length(trim(last_name)) > 0`
- **Indexes**:
  - `idx_users_role`: `CREATE INDEX idx_users_role ON users (role);`
  - *(Note: Index on `id` omitted as redundant with primary key `users_pkey`)*
- **ON DELETE Behavior**:
  - Direct deletion of the auth account in `auth.users` cascades to remove the public `users` row.
  - Platform operations soft-delete accounts by populating `deleted_at`.
- **RLS & Access Architecture**:
  - *INSERT*: Self-registration policy `users_insert_self` allows authenticated users to create their public profile matching `auth.uid()`.
  - *SELECT*: Self (`id = auth.uid()`), Admin all, or Organizations viewing student users who are discoverable or have active applications to their opportunities.
  - *UPDATE*: Self (`id = auth.uid()`) or Admin. **Privilege Escalation Protection**: Enforced via `trg_protect_user_role` calling `fn_protect_user_role()`, which strictly forbids any non-ADMIN user from mutating `role` or altering `id`.
  - *DELETE*: Admin only.

---

### 3.2 Table: `student_profiles`
- **Purpose**: Academic background, career goals, interests, and discovery settings for student users.
- **Physical Columns**:

| Column Name | PostgreSQL Data Type | Nullable | Default | PK / FK / Reference | Constraints & Rules |
|---|---|---|---|---|---|
| `user_id` | `UUID` | NOT NULL | — | **PK**, FK $\to$ `users(id)` | 1:1 Identity extension |
| `academic_year` | `INTEGER` | NOT NULL | — | — | `CHECK (academic_year BETWEEN 1 AND 6)` |
| `university` | `TEXT` | NOT NULL | — | — | Text attribute for MVP |
| `field_of_study` | `TEXT` | NOT NULL | — | — | Student major/discipline |
| `location` | `TEXT` | NULL | NULL | — | City, state, or campus location |
| `career_goals` | `TEXT` | NULL | NULL | — | Long-form trajectory statement |
| `career_goal_tags` | `TEXT[]` | NOT NULL | `'{}'` | — | Bounded target keyword tags |
| `interests` | `TEXT[]` | NOT NULL | `'{}'` | — | Subject/domain interests |
| `is_discoverable` | `BOOLEAN` | NOT NULL | `true` | — | Controls organization talent discovery |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Profile creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Maintained via trigger |

- **Foreign Keys**:
  - `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`
- **Unique Constraints**:
  - Primary Key on `user_id` (enforces strict 1:0..1 relationship with `users`)
- **Check Constraints**:
  - `chk_student_academic_year`: `academic_year BETWEEN 1 AND 6`
  - `chk_student_university`: `length(trim(university)) > 0`
  - `chk_student_field_of_study`: `length(trim(field_of_study)) > 0`
- **Indexes**:
  - `idx_student_profiles_discovery`: `CREATE INDEX idx_student_profiles_discovery ON student_profiles (is_discoverable, academic_year) WHERE is_discoverable = true;`
  - `idx_student_profiles_interests_gin`: `CREATE INDEX idx_student_profiles_interests_gin ON student_profiles USING GIN (interests);`
  - `idx_student_profiles_goal_tags_gin`: `CREATE INDEX idx_student_profiles_goal_tags_gin ON student_profiles USING GIN (career_goal_tags);`
- **ON DELETE Behavior**:
  - Cascades on parent `users` deletion.
- **RLS & Access Architecture**:
  - *Student Owner*: Full CRUD on own profile (`auth.uid() = user_id`).
  - *Organization Talent Discovery*: Organizations can SELECT profiles WHERE `is_discoverable = true`. (Returns professional fields: university, field_of_study, academic_year, location, career_goal_tags, interests).
  - *Organization Applicant Access*: Organizations can view full profile details for students who have submitted an active application to an opportunity owned by their organization.
  - *Admin*: Full read/moderation permissions.

---

### 3.3 Table: `skills`
- **Purpose**: Admin-curated, standardized skill taxonomy utilized across student profiles and opportunity requirements.
- **Physical Columns**:

| Column Name | PostgreSQL Data Type | Nullable | Default | PK / FK / Reference | Constraints & Rules |
|---|---|---|---|---|---|
| `id` | `UUID` | NOT NULL | `gen_random_uuid()` | **PK** | Surrogate identifier |
| `name` | `TEXT` | NOT NULL | — | — | Standardized skill name |
| `category` | `TEXT` | NOT NULL | — | — | Domain category |
| `description` | `TEXT` | NULL | NULL | — | Scope description |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Creation timestamp |

- **Unique Constraints**:
  - `uq_skills_name`: `UNIQUE (name)`
  - Functional Unique Index: `CREATE UNIQUE INDEX uq_skills_lower_name ON skills (lower(trim(name)));`
- **Check Constraints**:
  - `chk_skills_name`: `length(trim(name)) > 0`
  - `chk_skills_category`: `length(trim(category)) > 0`
- **Indexes**:
  - `idx_skills_category`: `CREATE INDEX idx_skills_category ON skills (category);`
- **ON DELETE Behavior**:
  - `ON DELETE RESTRICT` when referenced by `student_skills` or `opportunity_skills`. Master taxonomy cannot be destroyed while linked.
- **RLS & Access Architecture**:
  - *All Users / Public*: SELECT access for skill searching, tagging, and filtering.
  - *Admin*: Full INSERT, UPDATE, DELETE permissions for taxonomy management.

---

### 3.4 Table: `student_skills`
- **Purpose**: Junction table connecting students with standardized skills, capturing proficiency and experience.
- **Physical Columns**:

| Column Name | PostgreSQL Data Type | Nullable | Default | PK / FK / Reference | Constraints & Rules |
|---|---|---|---|---|---|
| `student_profile_id`| `UUID` | NOT NULL | — | **PK**, FK $\to$ `student_profiles(user_id)` | Owner profile |
| `skill_id` | `UUID` | NOT NULL | — | **PK**, FK $\to$ `skills(id)` | Master skill |
| `proficiency` | `INTEGER` | NOT NULL | — | — | `CHECK (proficiency BETWEEN 1 AND 5)` |
| `years_of_experience`| `NUMERIC(3,1)` | NULL | NULL | — | `CHECK (years_of_experience >= 0)` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Association timestamp |

- **Foreign Keys**:
  - `FOREIGN KEY (student_profile_id) REFERENCES student_profiles(user_id) ON DELETE CASCADE`
  - `FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE RESTRICT`
- **Unique Constraints**:
  - Primary Key on `(student_profile_id, skill_id)`
- **Check Constraints**:
  - `chk_student_skills_proficiency`: `proficiency BETWEEN 1 AND 5`
  - `chk_student_skills_years`: `years_of_experience IS NULL OR years_of_experience >= 0.0`
- **Indexes**:
  - `idx_student_skills_skill_id`: `CREATE INDEX idx_student_skills_skill_id ON student_skills (skill_id);`
- **ON DELETE Behavior**:
  - Cascades on `student_profiles` deletion.
  - Restricts deletion on master `skills`.
- **RLS & Access Architecture**:
  - *Student Owner*: Full CRUD (`auth.uid() = student_profile_id`).
  - *Organization Talent Discovery*: SELECT permitted for discoverable students.
  - *Organization Applicant Access*: SELECT permitted for applicants to own opportunities.

---

### 3.5 Table: `experiences`
- **Purpose**: Chronological student records representing past internships, employment, research, projects, or volunteer work.
- **Physical Columns**:

| Column Name | PostgreSQL Data Type | Nullable | Default | PK / FK / Reference | Constraints & Rules |
|---|---|---|---|---|---|
| `id` | `UUID` | NOT NULL | `gen_random_uuid()` | **PK** | Record identifier |
| `student_profile_id`| `UUID` | NOT NULL | — | FK $\to$ `student_profiles(user_id)` | Owner profile |
| `title` | `TEXT` | NOT NULL | — | — | Role / Position title |
| `organization_name`| `TEXT` | NOT NULL | — | — | Employer / Institution name (plain text) |
| `experience_type` | `experience_type`| NOT NULL | — | — | Classification enum |
| `start_date` | `DATE` | NOT NULL | — | — | Engagement start date |
| `end_date` | `DATE` | NULL | NULL | — | Engagement end date (NULL = ongoing) |
| `location` | `TEXT` | NULL | NULL | — | Location or 'Remote' |
| `description` | `TEXT` | NULL | NULL | — | Accomplishments & duties |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Maintained via trigger |

- **Foreign Keys**:
  - `FOREIGN KEY (student_profile_id) REFERENCES student_profiles(user_id) ON DELETE CASCADE`
- **Unique Constraints**:
  - Primary Key on `id`
- **Check Constraints**:
  - `chk_experience_dates`: `end_date IS NULL OR end_date >= start_date`
  - `chk_experience_title`: `length(trim(title)) > 0`
  - `chk_experience_org_name`: `length(trim(organization_name)) > 0`
- **Indexes**:
  - `idx_experiences_student`: `CREATE INDEX idx_experiences_student ON experiences (student_profile_id, start_date DESC);`
- **ON DELETE Behavior**:
  - Cascades on parent `student_profiles` deletion.
- **RLS & Access Architecture**:
  - *Student Owner*: Full CRUD (`auth.uid() = student_profile_id`).
  - *Organization Talent Discovery*: SELECT permitted for discoverable students.
  - *Organization Applicant Access*: SELECT permitted for applicants to own opportunities.

---

### 3.6 Table: `cvs`
- **Purpose**: Metadata and storage pointers for student uploaded curriculum vitae / resume documents.
- **Physical Columns**:

| Column Name | PostgreSQL Data Type | Nullable | Default | PK / FK / Reference | Constraints & Rules |
|---|---|---|---|---|---|
| `id` | `UUID` | NOT NULL | `gen_random_uuid()` | **PK** | Record identifier |
| `student_profile_id`| `UUID` | NOT NULL | — | FK $\to$ `student_profiles(user_id)` | Owner profile |
| `file_name` | `TEXT` | NOT NULL | — | — | Original file name |
| `file_path` | `TEXT` | NOT NULL | — | — | Supabase Storage bucket path |
| `file_type` | `TEXT` | NOT NULL | — | — | MIME type (e.g., 'application/pdf') |
| `file_size` | `INTEGER` | NOT NULL | — | — | Size in bytes (`CHECK > 0`) |
| `is_default` | `BOOLEAN` | NOT NULL | `false` | — | Primary active resume flag |
| `uploaded_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Upload timestamp |

- **Foreign Keys**:
  - `FOREIGN KEY (student_profile_id) REFERENCES student_profiles(user_id) ON DELETE CASCADE`
- **Unique Constraints / Partial Unique Indexes**:
  - Primary Key on `id`
  - **Single Default CV Enforcement**:
    `CREATE UNIQUE INDEX uq_cvs_single_default_per_student ON cvs (student_profile_id) WHERE is_default = true;`
- **Check Constraints**:
  - `chk_cvs_file_size`: `file_size > 0 AND file_size <= 10485760` (Max 10MB)
  - `chk_cvs_file_name`: `length(trim(file_name)) > 0`
  - `chk_cvs_file_path`: `length(trim(file_path)) > 0`
- **Indexes**:
  - `idx_cvs_student`: `CREATE INDEX idx_cvs_student ON cvs (student_profile_id);`
- **ON DELETE Behavior**:
  - Hard deletion on record removal. Deleting a CV row permanently purges the record (associated storage triggers delete the file).
  - Cascades on parent `student_profiles` deletion.
- **RLS & Access Architecture**:
  - *Student Owner*: Full CRUD (`auth.uid() = student_profile_id`).
  - *Talent Discovery*: **STRICTLY BLOCKED**. Organizations browsing talent discovery CANNOT view or download CVs.
  - *Organization Applicant Access*: Permitted to view CV records and download files ONLY for students who formally submitted an application to that organization's opportunities.
  - *Admin*: Audit read access.

---

### 3.7 Table: `organizations`
- **Purpose**: Institutional entity profile, corporate contact details, and accreditation/verification state.
- **Physical Columns**:

| Column Name | PostgreSQL Data Type | Nullable | Default | PK / FK / Reference | Constraints & Rules |
|---|---|---|---|---|---|
| `id` | `UUID` | NOT NULL | `gen_random_uuid()` | **PK** | Organization identifier |
| `name` | `TEXT` | NOT NULL | — | — | Registered institution name |
| `description` | `TEXT` | NULL | NULL | — | `CHECK (length(description) <= 2000)` |
| `website_url` | `TEXT` | NULL | NULL | — | Official domain URL |
| `contact_email` | `TEXT` | NULL | NULL | — | Institutional contact email (optional) |
| `contact_phone` | `TEXT` | NULL | NULL | — | Contact telephone number |
| `verification_status`| `org_verification_status`| NOT NULL | `'PENDING'`| — | Approval state |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Maintained via trigger |
| `deleted_at` | `TIMESTAMPTZ` | NULL | NULL | — | Soft deletion timestamp |

- **Unique Constraints**:
  - Primary Key on `id`
  - `uq_organizations_name`: `UNIQUE (name)`
- **Check Constraints**:
  - `chk_org_name`: `length(trim(name)) > 0`
  - `chk_org_description`: `description IS NULL OR length(description) <= 2000`
  - `chk_org_email`: `contact_email IS NULL OR contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'`
- **Indexes**:
  - `idx_organizations_verification`: `CREATE INDEX idx_organizations_verification ON organizations (verification_status) WHERE deleted_at IS NULL;`
  - *(Note: Index on `name` omitted as redundant with unique constraint `uq_organizations_name`)*
- **ON DELETE Behavior**:
  - Soft delete via `deleted_at`.
  - Master entity: `ON DELETE RESTRICT` from child opportunities.
- **RLS & Access Architecture**:
  - *INSERT*: Authenticated users with platform role `ORGANIZATION` (`organizations_insert`).
  - *SELECT*: Public / Students permitted on active, verified organizations (`verification_status = 'APPROVED' AND deleted_at IS NULL`); Organization members view their own organization regardless of status; Admins view all.
  - *UPDATE*: Organization members linked via `organization_members` can update general profile info (cannot alter `verification_status`); Admins full update authority.
  - *DELETE*: Admin only.

---

### 3.8 Table: `organization_members`
- **Purpose**: Connects authenticated `users` accounts to `organizations`.
- **Physical Columns**:

| Column Name | PostgreSQL Data Type | Nullable | Default | PK / FK / Reference | Constraints & Rules |
|---|---|---|---|---|---|
| `organization_id` | `UUID` | NOT NULL | — | **PK**, FK $\to$ `organizations(id)` | Associated organization |
| `user_id` | `UUID` | NOT NULL | — | **PK**, FK $\to$ `users(id)` | Authenticated representative |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Association timestamp |

- **Foreign Keys**:
  - `FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE`
  - `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`
- **Unique Constraints**:
  - Primary Key on `(organization_id, user_id)`
  - **MVP Single-Member Rule**: `uq_org_members_single_member_mvp`: `UNIQUE (organization_id)`
  - *Note*: Enforces exactly one member per organization for MVP. Dropping this single constraint post-MVP immediately unlocks multi-user tenancy without altering table structures.
- **Indexes**:
  - `idx_org_members_user_id`: `CREATE INDEX idx_org_members_user_id ON organization_members (user_id);`
- **ON DELETE Behavior**:
  - Cascades if either the organization or the user account is purged.
- **RLS & Access Architecture**:
  - *INSERT*: Authenticated user with role `ORGANIZATION` creating an initial membership for an unlinked organization, or Admin (`org_members_insert`).
  - *SELECT*: Member user viewing own membership records (`user_id = auth.uid()`), or Admin all.
  - *DELETE*: Member user leaving or Admin removing membership.
  - *UPDATE*: Admin only.

---

### 3.9 Table: `opportunities`
- **Purpose**: Job openings, internships, fellowships, hackathons, and competitions published by organizations.
- **Physical Columns**:

| Column Name | PostgreSQL Data Type | Nullable | Default | PK / FK / Reference | Constraints & Rules |
|---|---|---|---|---|---|
| `id` | `UUID` | NOT NULL | `gen_random_uuid()` | **PK** | Opportunity identifier |
| `organization_id` | `UUID` | NOT NULL | — | FK $\to$ `organizations(id)` | Publishing entity |
| `title` | `TEXT` | NOT NULL | — | — | Role title (`CHECK <= 200`) |
| `description` | `TEXT` | NOT NULL | — | — | Responsibilities & criteria (`CHECK <= 10000`) |
| `opportunity_type` | `opportunity_type`| NOT NULL | — | — | Classification enum |
| `status` | `opportunity_status`| NOT NULL | `'DRAFT'` | — | Lifecycle state |
| `location` | `TEXT` | NULL | NULL | — | Physical city, university, or campus |
| `is_remote` | `BOOLEAN` | NOT NULL | `false` | — | Remote eligibility flag |
| `application_deadline`| `TIMESTAMPTZ`| NULL | NULL | — | Optional application cutoff |
| `minimum_academic_year`| `INTEGER` | NULL | NULL | — | Range 1–6 |
| `maximum_academic_year`| `INTEGER` | NULL | NULL | — | Range 1–6 |
| `minimum_gpa` | `NUMERIC(3,2)` | NULL | NULL | — | Range 0.00–4.00 |
| `eligible_fields` | `TEXT[]` | NOT NULL | `'{}'` | — | Qualifying disciplines |
| `compensation` | `TEXT` | NULL | NULL | — | Stipend, salary, or prize details |
| `application_url` | `TEXT` | NULL | NULL | — | External destination URL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Maintained via trigger |
| `published_at` | `TIMESTAMPTZ` | NULL | NULL | — | Publication timestamp |
| `deleted_at` | `TIMESTAMPTZ` | NULL | NULL | — | Soft deletion timestamp |

- **Foreign Keys**:
  - `FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT`
- **Unique Constraints**:
  - Primary Key on `id`
- **Check Constraints**:
  - `chk_opportunities_title_len`: `length(trim(title)) > 0 AND length(title) <= 200`
  - `chk_opportunities_desc_len`: `length(trim(description)) > 0 AND length(description) <= 10000`
  - `chk_opportunities_year_min`: `minimum_academic_year IS NULL OR minimum_academic_year BETWEEN 1 AND 6`
  - `chk_opportunities_year_max`: `maximum_academic_year IS NULL OR maximum_academic_year BETWEEN 1 AND 6`
  - `chk_opportunities_year_range`: `minimum_academic_year IS NULL OR maximum_academic_year IS NULL OR minimum_academic_year <= maximum_academic_year`
  - `chk_opportunities_gpa`: `minimum_gpa IS NULL OR (minimum_gpa >= 0.00 AND minimum_gpa <= 4.00)`
- **Indexes**:
  - `idx_opportunities_discovery`: `CREATE INDEX idx_opportunities_discovery ON opportunities (status, opportunity_type, application_deadline) WHERE deleted_at IS NULL;`
  - `idx_opportunities_org_status`: `CREATE INDEX idx_opportunities_org_status ON opportunities (organization_id, status) WHERE deleted_at IS NULL;`
  - `idx_opportunities_eligible_fields_gin`: `CREATE INDEX idx_opportunities_eligible_fields_gin ON opportunities USING GIN (eligible_fields);`
- **ON DELETE Behavior**:
  - Soft delete via `deleted_at`.
  - `ON DELETE RESTRICT` from parent `organizations` prevents deleting an organization that owns existing opportunities.
- **RLS & Access Architecture**:
  - *Students / Public*: SELECT permitted on published, non-deleted opportunities (`status = 'PUBLISHED' AND deleted_at IS NULL`).
  - *Organization Member*:
    - *INSERT*: Can insert draft opportunities (`status = 'DRAFT'`) or submit for approval. Setting `status = 'PUBLISHED'` requires `organizations.verification_status = 'APPROVED'` (`opportunities_insert_member`).
    - *SELECT*: View all opportunities (including drafts) for organizations they belong to.
    - *UPDATE*: Update opportunities for own organization; setting `status = 'PUBLISHED'` strictly requires `organizations.verification_status = 'APPROVED'` (`opportunities_update_member`).
    - *DELETE*: Soft-delete opportunities for own organization (`opportunities_delete_member`).
  - *Admin*: Full moderation CRUD (`opportunities_admin_all`).

---

### 3.10 Table: `opportunity_skills`
- **Purpose**: Junction table specifying required versus preferred skill criteria for an opportunity.
- **Physical Columns**:

| Column Name | PostgreSQL Data Type | Nullable | Default | PK / FK / Reference | Constraints & Rules |
|---|---|---|---|---|---|
| `opportunity_id` | `UUID` | NOT NULL | — | **PK**, FK $\to$ `opportunities(id)` | Parent opportunity |
| `skill_id` | `UUID` | NOT NULL | — | **PK**, FK $\to$ `skills(id)` | Reusable skill |
| `requirement_level`| `skill_requirement_level`| NOT NULL | `'REQUIRED'`| — | Mandatory vs. preferred |

- **Foreign Keys**:
  - `FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE`
  - `FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE RESTRICT`
- **Unique Constraints**:
  - Primary Key on `(opportunity_id, skill_id)`
- **Indexes**:
  - `idx_opp_skills_skill_id`: `CREATE INDEX idx_opp_skills_skill_id ON opportunity_skills (skill_id);`
- **ON DELETE Behavior**:
  - Cascades on `opportunities` deletion.
  - Restricts deletion on master `skills`.
- **RLS & Access Architecture**:
  - *Public / Students*: SELECT permitted for skills tied to published opportunities.
  - *Organization Member*: Full CRUD on skills tied to opportunities owned by their organization.

---

### 3.11 Table: `saved_opportunities`
- **Purpose**: Independent student bookmarking of opportunities for future evaluation.
- **Physical Columns**:

| Column Name | PostgreSQL Data Type | Nullable | Default | PK / FK / Reference | Constraints & Rules |
|---|---|---|---|---|---|
| `student_profile_id`| `UUID` | NOT NULL | — | **PK**, FK $\to$ `student_profiles(user_id)` | Bookmarking student |
| `opportunity_id` | `UUID` | NOT NULL | — | **PK**, FK $\to$ `opportunities(id)` | Bookmarked opportunity |
| `saved_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Bookmark timestamp |

- **Foreign Keys**:
  - `FOREIGN KEY (student_profile_id) REFERENCES student_profiles(user_id) ON DELETE CASCADE`
  - `FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE`
- **Unique Constraints**:
  - Primary Key on `(student_profile_id, opportunity_id)`
- **Indexes**:
  - `idx_saved_opps_student`: `CREATE INDEX idx_saved_opps_student ON saved_opportunities (student_profile_id, saved_at DESC);`
- **ON DELETE Behavior**:
  - Hard deleted when unsaved.
  - Cascades if student profile or opportunity is purged.
- **RLS & Access Architecture**:
  - *Student Owner*: Full CRUD on own bookmarks (`auth.uid() = student_profile_id`).
  - *Organizations / Admins*: **NO ACCESS**. Bookmarks are strictly private student data.

---

### 3.12 Table: `applications`
- **Purpose**: Tracks formal candidate submissions to an opportunity through the evaluation workflow.
- **Physical Columns**:

| Column Name | PostgreSQL Data Type | Nullable | Default | PK / FK / Reference | Constraints & Rules |
|---|---|---|---|---|---|
| `id` | `UUID` | NOT NULL | `gen_random_uuid()` | **PK** | Application identifier |
| `student_profile_id`| `UUID` | NOT NULL | — | FK $\to$ `student_profiles(user_id)` | Applicant profile |
| `opportunity_id` | `UUID` | NOT NULL | — | FK $\to$ `opportunities(id)` | Target opportunity |
| `status` | `application_status`| NOT NULL | `'SUBMITTED'` | — | Progression state |
| `applied_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Submission timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Maintained via trigger |

- **Foreign Keys**:
  - `FOREIGN KEY (student_profile_id) REFERENCES student_profiles(user_id) ON DELETE RESTRICT`
  - `FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE RESTRICT`
- **Unique Constraints**:
  - Primary Key on `id`
  - `uq_applications_student_opportunity`: `UNIQUE (student_profile_id, opportunity_id)`
- **Indexes**:
  - `idx_applications_student_status`: `CREATE INDEX idx_applications_student_status ON applications (student_profile_id, status);`
  - `idx_applications_opp_status`: `CREATE INDEX idx_applications_opp_status ON applications (opportunity_id, status);`
- **ON DELETE Behavior**:
  - `ON DELETE RESTRICT` on both student and opportunity prevents accidental cascade deletion of active candidate application histories.
  - Candidate withdrawal does NOT delete the record; it transitions `status` to `'WITHDRAWN'`.
- **RLS & Access Architecture**:
  - *Student Owner*: SELECT own applications; INSERT to published opportunities; UPDATE `status` strictly to `'WITHDRAWN'` via policy `applications_update_student_withdraw` (`USING (student_profile_id = auth.uid() AND status NOT IN ('REJECTED','ACCEPTED','WITHDRAWN')) WITH CHECK (student_profile_id = auth.uid() AND status = 'WITHDRAWN')`).
  - *Organization Member*: SELECT and UPDATE candidate recruitment progression (`status`) on applications submitted to opportunities owned by their organization (`applications_update_org_admin`).
  - *Admin*: Full audit and management access.

---

### 3.13 Table: `assessments`
- **Purpose**: Opportunity-level evaluation instrument containing screening guidelines and benchmark parameters.
- **Physical Columns**:

| Column Name | PostgreSQL Data Type | Nullable | Default | PK / FK / Reference | Constraints & Rules |
|---|---|---|---|---|---|
| `id` | `UUID` | NOT NULL | `gen_random_uuid()` | **PK** | Assessment identifier |
| `opportunity_id` | `UUID` | NOT NULL | — | FK $\to$ `opportunities(id)` | Parent opportunity |
| `title` | `TEXT` | NOT NULL | — | — | Assessment title (`CHECK <= 200`) |
| `instructions` | `TEXT` | NULL | NULL | — | Candidate guidelines |
| `time_limit_minutes`| `INTEGER` | NULL | NULL | — | `CHECK (time_limit_minutes > 0)` |
| `status` | `assessment_status`| NOT NULL | `'DRAFT'` | — | Lifecycle state |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Maintained via trigger |

- **Foreign Keys**:
  - `FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE RESTRICT`
- **Unique Constraints**:
  - Primary Key on `id`
  - **1:0..1 Opportunity Assessment Invariant**: `uq_assessments_opportunity_id`: `UNIQUE (opportunity_id)`
- **Check Constraints**:
  - `chk_assessments_title`: `length(trim(title)) > 0 AND length(title) <= 200`
  - `chk_assessments_time_limit`: `time_limit_minutes IS NULL OR time_limit_minutes > 0`
- **Indexes**:
  - *(Note: Index on `opportunity_id` omitted as redundant with unique constraint `uq_assessments_opportunity_id`)*
- **ON DELETE Behavior**:
  - `ON DELETE RESTRICT` protects assessment instruments from deletion if referenced by candidate attempts.
- **RLS & Access Architecture**:
  - *Organization Member*: Full CRUD for assessments tied to opportunities owned by their organization. Activation requires explicit organization review.
  - *Student Applicant*: SELECT restricted to active assessment metadata for their application.
  - *Admin*: Audit read access.

---

### 3.14 Table: `assessment_questions`
- **Purpose**: Individual evaluation items (open text or multiple choice) belonging to an assessment.
- **Physical Columns**:

| Column Name | PostgreSQL Data Type | Nullable | Default | PK / FK / Reference | Constraints & Rules |
|---|---|---|---|---|---|
| `id` | `UUID` | NOT NULL | `gen_random_uuid()` | **PK** | Question identifier |
| `assessment_id` | `UUID` | NOT NULL | — | FK $\to$ `assessments(id)` | Parent assessment |
| `question_text` | `TEXT` | NOT NULL | — | — | Prompt text |
| `question_type` | `assessment_question_type`| NOT NULL | — | — | TEXT or MULTIPLE_CHOICE |
| `question_order` | `INTEGER` | NOT NULL | — | — | Sequence order (`CHECK >= 1`) |
| `is_ai_generated`| `BOOLEAN` | NOT NULL | `false` | — | AI provenance flag |
| `options` | `JSONB` | NULL | NULL | — | Structured MCQ options array |
| `reference_answer`| `TEXT` | NULL | NULL | — | Answer key (HIDDEN from students) |
| `evaluation_guidance`| `TEXT` | NULL | NULL | — | Rubric guidelines (HIDDEN from students) |
| `requirement_level`| `skill_requirement_level`| NOT NULL | `'REQUIRED'`| — | Question evaluation weighting |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Maintained via trigger |

- **Foreign Keys**:
  - `FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE`
- **Unique Constraints**:
  - Primary Key on `id`
  - `uq_assessment_questions_order`: `UNIQUE (assessment_id, question_order)`
  - **Composite Key for Diamond Integrity**: `uq_assessment_questions_id_assessment`: `UNIQUE (id, assessment_id)`
- **Check Constraints**:
  - `chk_questions_order`: `question_order >= 1`
  - `chk_questions_text`: `length(trim(question_text)) > 0`
  - `chk_questions_mcq_options`: `(question_type = 'MULTIPLE_CHOICE' AND options IS NOT NULL) OR (question_type = 'TEXT')`
- **Indexes**:
  - *(Note: Index on `(assessment_id, question_order)` omitted as redundant with unique constraint `uq_assessment_questions_order`)*
- **ON DELETE Behavior**:
  - Cascades on parent `assessments` deletion.
- **RLS & Candidate Privacy Architecture**:
  - *Base Table Protection*: Direct access on `assessment_questions` is restricted via RLS (`assessment_questions_select_org_admin`) strictly to organization members owning the assessment and platform admins.
  - *Candidate Privacy View (`candidate_assessment_questions`)*: Student candidates access questions strictly through the `candidate_assessment_questions` secure view (`security_barrier = true`). This view projects strictly `(id, assessment_id, question_text, question_type, question_order, options, requirement_level)` for candidates with an active attempt. Sensitive columns `reference_answer` and `evaluation_guidance` are physically excluded from the projection.
  - *Admin*: Audit read access on base table.

---

### 3.15 Table: `assessment_attempts`
- **Purpose**: Candidate's single test execution instance linked to their application.
- **Physical Columns**:

| Column Name | PostgreSQL Data Type | Nullable | Default | PK / FK / Reference | Constraints & Rules |
|---|---|---|---|---|---|
| `id` | `UUID` | NOT NULL | `gen_random_uuid()` | **PK** | Attempt identifier |
| `application_id` | `UUID` | NOT NULL | — | FK $\to$ `applications(id)` | Candidate application |
| `assessment_id` | `UUID` | NOT NULL | — | FK $\to$ `assessments(id)` | Test instrument |
| `status` | `assessment_attempt_status`| NOT NULL | `'NOT_STARTED'`| — | Execution lifecycle |
| `started_at` | `TIMESTAMPTZ` | NULL | NULL | — | Commencement timestamp |
| `submitted_at` | `TIMESTAMPTZ` | NULL | NULL | — | Final submission timestamp |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Maintained via trigger |

- **Foreign Keys**:
  - `FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE RESTRICT`
  - `FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE RESTRICT`
- **Unique Constraints**:
  - Primary Key on `id`
  - **MVP No-Retakes Invariant**: `uq_assessment_attempts_app`: `UNIQUE (application_id)`
  - **Composite Key for Diamond Integrity**: `uq_assessment_attempts_id_assessment`: `UNIQUE (id, assessment_id)`
- **Check Constraints**:
  - `chk_attempt_timestamps`: `submitted_at IS NULL OR started_at IS NULL OR submitted_at >= started_at`
- **Indexes**:
  - `idx_attempts_assessment`: `CREATE INDEX idx_attempts_assessment ON assessment_attempts (assessment_id, status);`
  - *(Note: Index on `application_id` omitted as redundant with unique constraint `uq_assessment_attempts_app`)*
- **ON DELETE Behavior**:
  - `ON DELETE RESTRICT` on both `application_id` and `assessment_id` prevents wiping candidate testing audit histories.
- **Cross-Entity Diamond Consistency**:
  - Enforced via validation trigger `trg_check_attempt_opportunity` ensuring `applications.opportunity_id = assessments.opportunity_id`.
- **RLS & Access Architecture**:
  - *Student Owner*: INSERT and SELECT own attempt linked to their own application; UPDATE `started_at`, `submitted_at`, and `status`.
  - *Organization Member*: SELECT attempts for candidates applying to opportunities owned by their organization.
  - *Admin*: Audit read access.

---

### 3.16 Table: `assessment_answers`
- **Purpose**: Candidate's submitted text or selected option for a specific assessment question.
- **Physical Columns**:

| Column Name | PostgreSQL Data Type | Nullable | Default | PK / FK / Reference | Constraints & Rules |
|---|---|---|---|---|---|
| `id` | `UUID` | NOT NULL | `gen_random_uuid()` | **PK** | Answer identifier |
| `assessment_attempt_id`| `UUID` | NOT NULL | — | FK $\to$ `assessment_attempts(id)` | Parent attempt |
| `assessment_question_id`|`UUID` | NOT NULL | — | FK $\to$ `assessment_questions(id)`| Target question |
| `assessment_id` | `UUID` | NOT NULL | — | Enforces diamond integrity | Must match attempt & question |
| `answer_text` | `TEXT` | NOT NULL | — | — | Submitted response |
| `answered_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Submission timestamp |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Maintained via trigger |

- **Foreign Keys**:
  - **Composite FK 1 (Attempt-Assessment Bond)**:
    `FOREIGN KEY (assessment_attempt_id, assessment_id) REFERENCES assessment_attempts(id, assessment_id) ON DELETE CASCADE`
  - **Composite FK 2 (Question-Assessment Bond)**:
    `FOREIGN KEY (assessment_question_id, assessment_id) REFERENCES assessment_questions(id, assessment_id) ON DELETE RESTRICT`
  - *Note*: These two composite foreign keys guarantee declaratively at the PostgreSQL engine level that the question being answered belongs to the exact same assessment instrument as the attempt. Cross-test corruption is physically impossible.
- **Unique Constraints**:
  - Primary Key on `id`
  - `uq_answers_attempt_question`: `UNIQUE (assessment_attempt_id, assessment_question_id)`
- **Indexes**:
  - `idx_answers_attempt`: `CREATE INDEX idx_answers_attempt ON assessment_answers (assessment_attempt_id);`
  - `idx_answers_question`: `CREATE INDEX idx_answers_question ON assessment_answers (assessment_question_id);`
- **ON DELETE Behavior**:
  - Cascades on parent `assessment_attempts` deletion.
  - Restricts deletion on `assessment_questions`.
- **RLS & Access Architecture**:
  - *Student Owner*: INSERT and UPDATE during active attempt (`status = 'IN_PROGRESS'`).
  - *Organization Member*: SELECT submitted answers for applicants to their opportunities once submitted.
  - *Admin*: Audit read access.

---

### 3.17 Table: `assessment_results`
- **Purpose**: Evaluated scoring, rubric match, strengths/weaknesses, and feedback for an assessment attempt, supporting AI evaluation, human reviewer override, and final authoritative decision.
- **Physical Columns**:

| Column Name | PostgreSQL Data Type | Nullable | Default | PK / FK / Reference | Constraints & Rules |
|---|---|---|---|---|---|
| `id` | `UUID` | NOT NULL | `gen_random_uuid()` | **PK** | Result identifier |
| `assessment_attempt_id`| `UUID` | NOT NULL | — | FK $\to$ `assessment_attempts(id)` | Target attempt |
| **AI Evaluation Provenance** | | | | | |
| `ai_score` | `INTEGER` | NULL | NULL | — | `CHECK (ai_score BETWEEN 0 AND 100)` |
| `ai_requirement_match`| `TEXT` | NULL | NULL | — | Analysis of match against requirements |
| `ai_skill_analysis`| `JSONB` | NULL | NULL | — | Structured skill-by-skill evaluation |
| `ai_strengths` | `TEXT[]` | NULL | NULL | — | AI-detected candidate competencies |
| `ai_gaps` | `TEXT[]` | NULL | NULL | — | AI-detected gaps / missing skills |
| `ai_summary` | `TEXT` | NULL | NULL | — | AI evaluation summary narrative |
| `ai_evaluated_at` | `TIMESTAMPTZ` | NULL | NULL | — | AI scoring completion timestamp |
| **Human Recruiter Review** | | | | | |
| `human_score` | `INTEGER` | NULL | NULL | — | `CHECK (human_score BETWEEN 0 AND 100)` |
| `human_feedback` | `TEXT` | NULL | NULL | — | Recruiter qualitative assessment |
| `human_evaluator_id`| `UUID` | NULL | NULL | FK $\to$ `users(id)` | Reviewer user identity |
| `human_evaluated_at`| `TIMESTAMPTZ`| NULL | NULL | — | Recruiter review timestamp |
| **Final Authoritative Decision** | | | | | |
| `final_score` | `INTEGER` | NOT NULL | — | — | `CHECK (final_score BETWEEN 0 AND 100)` |
| `final_summary` | `TEXT` | NOT NULL | — | — | Authoritative decision summary |
| `final_strengths` | `TEXT[]` | NOT NULL | `'{}'` | — | Final confirmed strengths |
| `final_gaps` | `TEXT[]` | NOT NULL | `'{}'` | — | Final confirmed gaps |
| `is_final_approved`| `BOOLEAN` | NOT NULL | `false` | — | Recruiter sign-off flag |
| `approved_at` | `TIMESTAMPTZ` | NULL | NULL | — | Final sign-off timestamp |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Maintained via trigger |

- **Foreign Keys**:
  - `FOREIGN KEY (assessment_attempt_id) REFERENCES assessment_attempts(id) ON DELETE CASCADE`
  - `FOREIGN KEY (human_evaluator_id) REFERENCES users(id) ON DELETE SET NULL`
- **Unique Constraints**:
  - Primary Key on `id`
  - **1:0..1 Attempt Result Invariant**: `uq_assessment_results_attempt`: `UNIQUE (assessment_attempt_id)`
- **Check Constraints**:
  - `chk_results_ai_score`: `ai_score IS NULL OR (ai_score BETWEEN 0 AND 100)`
  - `chk_results_human_score`: `human_score IS NULL OR (human_score BETWEEN 0 AND 100)`
  - `chk_results_final_score`: `final_score BETWEEN 0 AND 100`
- **Indexes**:
  - *(Note: Index on `assessment_attempt_id` omitted as redundant with unique constraint `uq_assessment_results_attempt`)*
- **ON DELETE Behavior**:
  - Cascades on parent `assessment_attempts` deletion.
- **RLS & Access Architecture**:
  - *Organization Member*:
    - *INSERT*: Permitted to insert evaluation results for candidates who completed an assessment attempt tied to opportunities owned by their organization (`assessment_results_insert_org`).
    - *SELECT / UPDATE*: Full SELECT and UPDATE permissions for results of candidates who applied to their organization's opportunities. Recruiter authority over human score, feedback, and final approval sign-off.
  - *Student Applicant*: **STRICTLY BLOCKED IN MVP**. Candidates receive a successful submission confirmation; internal advisory scoring rubrics are withheld from applicant access.
  - *Admin*: Audit read access.

---

### 3.18 Table: `notifications`
- **Purpose**: System and platform alerts delivered to authenticated users across all personas.
- **Physical Columns**:

| Column Name | PostgreSQL Data Type | Nullable | Default | PK / FK / Reference | Constraints & Rules |
|---|---|---|---|---|---|
| `id` | `UUID` | NOT NULL | `gen_random_uuid()` | **PK** | Alert identifier |
| `user_id` | `UUID` | NOT NULL | — | FK $\to$ `users(id)` | Target recipient |
| `title` | `TEXT` | NOT NULL | — | — | Alert headline |
| `content` | `TEXT` | NOT NULL | — | — | Message payload |
| `is_read` | `BOOLEAN` | NOT NULL | `false` | — | Read receipt flag |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Dispatch timestamp |

- **Foreign Keys**:
  - `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`
- **Unique Constraints**:
  - Primary Key on `id`
- **Check Constraints**:
  - `chk_notifications_title`: `length(trim(title)) > 0`
  - `chk_notifications_content`: `length(trim(content)) > 0`
- **Indexes**:
  - `idx_notifications_user_unread`: `CREATE INDEX idx_notifications_user_unread ON notifications (user_id, created_at DESC) WHERE is_read = false;`
- **ON DELETE Behavior**:
  - Cascades on recipient `users` deletion.
- **RLS & Access Architecture**:
  - *User Recipient*: SELECT and UPDATE `is_read` on own notifications (`user_id = auth.uid()`).
  - *Edge Functions / Backend*: Elevated service role executes notification creation.

---

### 3.19 Table: `reports`
- **Purpose**: Platform trust, safety, and moderation reporting mechanism for flagging prohibited platform activity.
- **Physical Columns**:

| Column Name | PostgreSQL Data Type | Nullable | Default | PK / FK / Reference | Constraints & Rules |
|---|---|---|---|---|---|
| `id` | `UUID` | NOT NULL | `gen_random_uuid()` | **PK** | Report identifier |
| `reporter_id` | `UUID` | NOT NULL | — | FK $\to$ `users(id)` | Submitting user |
| `reported_opportunity_id`|`UUID`| NULL | NULL | FK $\to$ `opportunities(id)`| Flagged opportunity |
| `reported_organization_id`|`UUID`| NULL | NULL | FK $\to$ `organizations(id)`| Flagged organization |
| `reported_user_id` | `UUID` | NULL | NULL | FK $\to$ `users(id)` | Flagged user account |
| `reason` | `report_reason` | NOT NULL | — | — | Controlled violation enum |
| `description` | `TEXT` | NOT NULL | — | — | Details of violation |
| `status` | `report_status` | NOT NULL | `'PENDING'`| — | Adjudication lifecycle |
| `admin_notes` | `TEXT` | NULL | NULL | — | Internal moderator notes |
| `resolved_by` | `UUID` | NULL | NULL | FK $\to$ `users(id)` | Adjudicating administrator |
| `resolved_at` | `TIMESTAMPTZ` | NULL | NULL | — | Adjudication timestamp |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Report submission timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | — | Maintained via trigger |

- **Foreign Keys**:
  - `FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE RESTRICT`
  - `FOREIGN KEY (reported_opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE`
  - `FOREIGN KEY (reported_organization_id) REFERENCES organizations(id) ON DELETE CASCADE`
  - `FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE`
  - `FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL`
- **Unique Constraints**:
  - Primary Key on `id`
- **Check Constraints**:
  - **Exclusive Target Invariant**:
    `chk_reports_exclusive_target`: `CHECK (num_nonnulls(reported_opportunity_id, reported_organization_id, reported_user_id) = 1)`
  - `chk_reports_description`: `length(trim(description)) > 0`
- **Indexes**:
  - `idx_reports_reporter_id`: `CREATE INDEX idx_reports_reporter_id ON reports (reporter_id);`
  - `idx_reports_pending_status`: `CREATE INDEX idx_reports_pending_status ON reports (status, created_at) WHERE status = 'PENDING';`
  - `idx_reports_target_opp`: `CREATE INDEX idx_reports_target_opp ON reports (reported_opportunity_id) WHERE reported_opportunity_id IS NOT NULL;`
  - `idx_reports_target_org`: `CREATE INDEX idx_reports_target_org ON reports (reported_organization_id) WHERE reported_organization_id IS NOT NULL;`
  - `idx_reports_target_usr`: `CREATE INDEX idx_reports_target_usr ON reports (reported_user_id) WHERE reported_user_id IS NOT NULL;`
- **ON DELETE Behavior**:
  - `reporter_id` uses `ON DELETE RESTRICT` to prevent purging users while their filed moderation reports remain pending.
  - Cascades on target records if an abusive opportunity, organization, or user is purged.
- **RLS & Access Architecture**:
  - *Authenticated Users*: INSERT reports; SELECT reports submitted by themselves (`reporter_id = auth.uid()`).
  - *Reported Targets*: **STRICTLY BLOCKED**. Flagged parties cannot view reports lodged against them.
  - *Admin*: Full CRUD; exclusively authorized to update `status`, `admin_notes`, and resolution timestamps.

---

## 4. Referential Integrity & Foreign Key Delete Matrix

The following matrix documents the deliberate `ON DELETE` behavior for every foreign key relationship in the database:

| Child Table | Foreign Key Column | Parent Referenced Table | ON DELETE Action | Architectural Rationale |
|---|---|---|---|---|
| `users` | `id` | `auth.users(id)` | `CASCADE` | Purging auth account removes public profile. |
| `student_profiles` | `user_id` | `users(id)` | `CASCADE` | Student profile cannot exist without parent user account. |
| `student_skills` | `student_profile_id` | `student_profiles(user_id)` | `CASCADE` | Skill junction has no meaning without the student. |
| `student_skills` | `skill_id` | `skills(id)` | `RESTRICT` | Master taxonomy terms cannot be deleted while assigned to students. |
| `experiences` | `student_profile_id` | `student_profiles(user_id)` | `CASCADE` | Portfolio entries belong strictly to the student. |
| `cvs` | `student_profile_id` | `student_profiles(user_id)` | `CASCADE` | Resume files belong strictly to the student. |
| `organization_members`| `organization_id` | `organizations(id)` | `CASCADE` | Membership dissolves when organization is purged. |
| `organization_members`| `user_id` | `users(id)` | `CASCADE` | Membership dissolves when user account is purged. |
| `opportunities` | `organization_id` | `organizations(id)` | `RESTRICT` | Organizations cannot be deleted if active opportunities exist (prevents orphan jobs). |
| `opportunity_skills`| `opportunity_id` | `opportunities(id)` | `CASCADE` | Criteria junction deleted when opportunity is purged. |
| `opportunity_skills`| `skill_id` | `skills(id)` | `RESTRICT` | Master skills cannot be deleted while required by opportunities. |
| `saved_opportunities`| `student_profile_id` | `student_profiles(user_id)` | `CASCADE` | Bookmarks purged when student is deleted. |
| `saved_opportunities`| `opportunity_id` | `opportunities(id)` | `CASCADE` | Bookmarks purged when opportunity is deleted. |
| `applications` | `student_profile_id` | `student_profiles(user_id)` | `RESTRICT` | Student accounts cannot be hard-purged while active recruitment records exist. |
| `applications` | `opportunity_id` | `opportunities(id)` | `RESTRICT` | Opportunities cannot be hard-purged while active candidate submissions exist. |
| `assessments` | `opportunity_id` | `opportunities(id)` | `RESTRICT` | Assessment cannot be purged independently while tied to recruiting opportunity. |
| `assessment_questions`| `assessment_id` | `assessments(id)` | `CASCADE` | Questions belong strictly to assessment instrument. |
| `assessment_attempts`| `application_id` | `applications(id)` | `RESTRICT` | Protects candidate test history from accidental parent deletion. |
| `assessment_attempts`| `assessment_id` | `assessments(id)` | `RESTRICT` | Protects assessment attempts from test blueprint deletion. |
| `assessment_answers`| `(assessment_attempt_id, assessment_id)` | `assessment_attempts(id, assessment_id)` | `CASCADE` | Answers belong strictly to attempt instance. |
| `assessment_answers`| `(assessment_question_id, assessment_id)` | `assessment_questions(id, assessment_id)` | `RESTRICT` | Questions cannot be dropped while candidate submissions reference them. |
| `assessment_results`| `assessment_attempt_id`| `assessment_attempts(id)` | `CASCADE` | Result belongs strictly to attempt instance. |
| `assessment_results`| `human_evaluator_id` | `users(id)` | `SET NULL` | Preserves evaluation output if reviewer account is subsequently deleted. |
| `notifications` | `user_id` | `users(id)` | `CASCADE` | Notifications purged when recipient user is deleted. |
| `reports` | `reporter_id` | `users(id)` | `RESTRICT` | Reporter account cannot be deleted while open reports require investigation. |
| `reports` | `reported_opportunity_id`| `opportunities(id)` | `CASCADE` | Report target reference clears if opportunity is purged. |
| `reports` | `reported_organization_id`| `organizations(id)`| `CASCADE` | Report target reference clears if organization is purged. |
| `reports` | `reported_user_id` | `users(id)` | `CASCADE` | Report target reference clears if user is purged. |
| `reports` | `resolved_by` | `users(id)` | `SET NULL` | Preserves moderation record if admin account is subsequently removed. |

---

## 5. Diamond Consistency & Multi-Table Invariants

The logical model contains two critical cross-table integrity challenges:

### 5.1 Diamond 1: Application, Assessment, and Opportunity Invariant
```text
          ┌──────────────┐
          │ Opportunity  │
          └──────┬───────┘
                 │
       ┌─────────┴─────────┐
       ▼                   ▼
┌─────────────┐     ┌────────────┐
│ Application │     │ Assessment │
└──────┬──────┘     └─────┬──────┘
       │                  │
       └─────────┬────────┘
                 ▼
     ┌───────────────────────┐
     │   AssessmentAttempt   │
     └───────────────────────┘
```
**Invariant**: An `assessment_attempts` record references both an `application_id` and an `assessment_id`. The referenced application and assessment **MUST** belong to the exact same opportunity.

**Enforcement**:
Enforced via a PostgreSQL before-insert/update trigger function:
```sql
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_attempt_opportunity
BEFORE INSERT OR UPDATE ON assessment_attempts
FOR EACH ROW
EXECUTE FUNCTION fn_validate_attempt_opportunity();
```

---

### 5.2 Diamond 2: Assessment Question, Attempt, and Answer Invariant
```text
          ┌──────────────┐
          │  Assessment  │
          └──────┬───────┘
                 │
       ┌─────────┴─────────┐
       ▼                   ▼
┌─────────────┐     ┌────────────────────┐
│   Attempt   │     │ AssessmentQuestion │
└──────┬──────┘     └─────┬──────────────┘
       │                  │
       └─────────┬────────┘
                 ▼
     ┌───────────────────────┐
     │   AssessmentAnswer    │
     └───────────────────────┘
```
**Invariant**: A candidate answer must associate an attempt for Assessment $A$ strictly with a question belonging to Assessment $A$. It must be physically impossible to answer Question $B_1$ in Attempt $A_1$.

**Declarative Enforcement via Composite Foreign Keys**:
Instead of relying on procedural triggers, this invariant is enforced declaratively at the relational engine level:
1. `assessment_attempts` enforces `UNIQUE (id, assessment_id)`.
2. `assessment_questions` enforces `UNIQUE (id, assessment_id)`.
3. `assessment_answers` stores `(assessment_attempt_id, assessment_question_id, assessment_id)`.
4. Composite FK 1: `FOREIGN KEY (assessment_attempt_id, assessment_id) REFERENCES assessment_attempts(id, assessment_id) ON DELETE CASCADE`.
5. Composite FK 2: `FOREIGN KEY (assessment_question_id, assessment_id) REFERENCES assessment_questions(id, assessment_id) ON DELETE RESTRICT`.

PostgreSQL guarantees that an answer cannot be inserted unless both the attempt and the question share the identical `assessment_id`.

---

## 6. Row Level Security (RLS) Policy Architecture

All 19 tables have Row Level Security explicitly enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`).

Security is founded on helper functions extracting the authenticated actor's context:

```sql
-- Helper 1: Extract authenticated user's platform role
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS user_role AS $$
    SELECT role FROM users WHERE id = auth.uid() AND deleted_at IS NULL;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- Helper 2: Check if authenticated user is member of a given organization
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_id = org_id AND user_id = auth.uid()
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;
```

### Policy Summary Table

| Table | SELECT Policy | INSERT Policy | UPDATE Policy | DELETE Policy |
|---|---|---|---|---|
| `users` | Self (`id = auth.uid()`), Admins, Orgs for discoverable students / active applicants | Self (`id = auth.uid()`) | Self (`id = auth.uid()`) OR Admin (`fn_protect_user_role` trigger blocks non-admin role mutation) | Admin only |
| `student_profiles` | Self, Admins, Orgs for discoverable profiles (`is_discoverable = true`), OR Orgs for active applicants | Self (`user_id = auth.uid()` AND `role = 'STUDENT'`) | Self (`user_id = auth.uid()`) | Self OR Admin |
| `skills` | Authenticated users & Public | Admin only | Admin only | Admin only |
| `student_skills` | Self, Admins, Orgs for discoverable students OR active applicants | Self (`student_profile_id = auth.uid()`) | Self (`student_profile_id = auth.uid()`) | Self (`student_profile_id = auth.uid()`) |
| `experiences` | Self, Admins, Orgs for discoverable students OR active applicants | Self (`student_profile_id = auth.uid()`) | Self (`student_profile_id = auth.uid()`) | Self (`student_profile_id = auth.uid()`) |
| `cvs` | Self, Admins, OR Orgs **strictly for active applicants to own opportunities** (Discovery blocked) | Self (`student_profile_id = auth.uid()`) | Self (`student_profile_id = auth.uid()`) | Self (`student_profile_id = auth.uid()`) |
| `organizations` | Public / Students for `APPROVED` non-deleted orgs; Members for own org; Admins all | Authenticated Org role (`role = 'ORGANIZATION'`) | Members for own org (cannot alter verification status); Admins all | Admin only |
| `organization_members`| Members for own org; Admins all | Authenticated Org role (initial claim) OR Admin | Admin only | Self leave OR Admin |
| `opportunities` | Public / Students for `PUBLISHED` non-deleted; Members for own org; Admins all | Members of own org (`DRAFT` allowed; `PUBLISHED` requires org `APPROVED`) | Members of own org (`PUBLISHED` requires org `APPROVED`); Admins all | Members of own org (soft delete); Admins all |
| `opportunity_skills`| Public for published opps; Members for own opps; Admins all | Members of own opp | Members of own opp | Members of own opp |
| `saved_opportunities`| Student owner only (`student_profile_id = auth.uid()`) | Student owner only | None (hard delete) | Student owner only |
| `applications` | Student for own; Orgs for applications to own opportunities; Admins all | Student for own to published opps | Student strictly to `'WITHDRAWN'` (active only); Orgs for candidate progression; Admins all | Blocked (Withdrawal model) |
| `assessments` | Orgs for own opps; Students for details upon active application; Admins all | Members of approved org | Members of approved org | Members of approved org |
| `assessment_questions`| Orgs for own assessments; Admins all (**Base table blocked from students**) | Members of own assessment | Members of own assessment | Members of own assessment |
| `candidate_assessment_questions` *(View)*| Students during active attempt (redacted answers/guidance); Orgs / Admins | N/A (View) | N/A (View) | N/A (View) |
| `assessment_attempts` | Student for own attempt; Orgs for applicants to own opps; Admins all | Student for own application | Student during active attempt (started/submitted) | Blocked (Audit safety) |
| `assessment_answers` | Student during active attempt; Orgs for completed attempts to own opps; Admins all | Student during active attempt | Student during active attempt | Blocked (Audit safety) |
| `assessment_results` | Orgs for applicants to own opportunities; Admins all (**Students blocked in MVP**) | Orgs for completed attempts to own opps; Service role | Orgs for human evaluation and final approval | Blocked (Audit safety) |
| `notifications` | Recipient user only (`user_id = auth.uid()`) | Service role / Edge function | Recipient user (mark `is_read`) | Recipient user |
| `reports` | Reporter for own filed reports; Admins all (**Reported entities blocked**) | Authenticated users | Admin only | Admin only |

---

## 7. Performance & Indexing Strategy

Indexes are created strategically based on identified access patterns to avoid index bloat while guaranteeing $O(\log N)$ lookups:

1. **Foreign Key Indexing**: All junction and child foreign keys are explicitly indexed (`student_profile_id`, `opportunity_id`, `assessment_id`, `application_id`, `skill_id`, `reporter_id`) to accelerate join execution.
2. **Index Hygiene & Redundancy Prevention**:
   - Redundant B-tree indexes on columns already covered by `UNIQUE` or `PRIMARY KEY` constraints have been strictly eliminated:
     - `assessments(opportunity_id)` (covered by `uq_assessments_opportunity_id`)
     - `assessment_questions(assessment_id, question_order)` (covered by `uq_assessment_questions_order`)
     - `assessment_attempts(application_id)` (covered by `uq_assessment_attempts_app`)
     - `assessment_results(assessment_attempt_id)` (covered by `uq_assessment_results_attempt`)
     - `organizations(name)` (covered by `uq_organizations_name`)
     - `users(id)` (covered by `users_pkey`)
   - Added foreign key index `idx_reports_reporter_id ON reports (reporter_id)` for user audit operations.
3. **Partial Indexes for Selective Discovery**:
   - `opportunities`: Indexed on `(status, opportunity_type, application_deadline) WHERE deleted_at IS NULL` for active student search.
   - `student_profiles`: Indexed on `(is_discoverable, academic_year) WHERE is_discoverable = true` for recruiter discovery.
   - `notifications`: Partial index on `(user_id, created_at DESC) WHERE is_read = false` to make unread notification count queries instant ($O(1)$).
   - `reports`: Partial index on `(status, created_at) WHERE status = 'PENDING'` for administrative moderation queues.
4. **GIN Indexes for Set & Array Operations**:
   - `student_profiles.interests`: PostgreSQL GIN index for overlap (`&&`) and containment (`@>`) filtering.
   - `student_profiles.career_goal_tags`: GIN index for keyword matching.
   - `opportunities.eligible_fields`: GIN index for academic eligibility filtering.
5. **Partial Unique Indexes for Business Rules**:
   - `cvs`: `CREATE UNIQUE INDEX uq_cvs_single_default_per_student ON cvs (student_profile_id) WHERE is_default = true;` guarantees that at most one resume can be marked default per student without triggers.
   - `organization_members`: `CREATE UNIQUE INDEX uq_org_members_single_member_mvp ON organization_members (organization_id);` enforces single-user tenancy per organization in MVP.

---

## 8. Supabase Auth & Storage Integration

### 8.1 Supabase Auth Relationship
- Application authentication is delegated entirely to Supabase Auth (`auth.users`).
- No passwords, hashes, salts, or reset tokens exist in the public application database.
- Upon successful authentication, a database trigger or signup Edge Function inserts the profile into `public.users` utilizing `NEW.id` matching `auth.uid()`.
- Email addresses reside securely inside `auth.users` to prevent out-of-sync credential duplication.

### 8.2 Supabase Storage Integration
- Student CV documents are stored in a private Supabase Storage bucket named `resumes`.
- `cvs.file_path` stores the relative storage object path (e.g., `students/{user_id}/cvs/{cv_uuid}.pdf`).
- Supabase Storage RLS policies match database RLS:
  - Students have read/write access to their own storage directory (`students/{auth.uid()}/*`).
  - Organizations receive signed read URLs generated by Edge Functions strictly after validating that the candidate has an active application to an opportunity owned by that organization.

---

## 9. Architectural Integrity & Audit Sign-Off

- **19 Logical Entities Maintained**: Exactly 19 relational tables correspond to the 19 approved domain entities.
- **UUID Primary Key Standard**: Fully unified using `gen_random_uuid()` and `auth.users` references.
- **Controlled Taxonomies**: 12 native PostgreSQL ENUM types replace arbitrary strings.
- **Selective Soft Delete**: Applied strictly to `users`, `organizations`, and `opportunities`.
- **Diamond Dependencies Secured**: Guaranteed via composite foreign keys and database triggers.
- **Talent Discovery vs. Privacy**: Enforces `is_discoverable` while blocking CVs, contact details, and assessment results from discovery browsing.
- **AI Provenance Preserved**: AI score/rubric, human recruiter override, and final approval are independently maintained in `assessment_results`.
- **Single-Member MVP with Clean Extensibility**: Enforced via `UNIQUE(organization_id)` on `organization_members`.
- **Exclusive Report Target**: Guaranteed via `CHECK (num_nonnulls(...) = 1)`.
