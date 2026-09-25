# Day 3 & 4 Backend Foundation Report

---

## Metadata

* **Project:** Campus Opportunity Hub
* **Team:** APEX
* **Contributor:** Yetemgeta Bekele
* **GitHub:** [@yetemgetaB](https://github.com/yetemgetaB)
* **Role:** Backend 2
* **Dates:** 2026-09-22
* **Scope:** Database + Opportunity/Application foundation + shared backend infrastructure

---

## 1. Objectives

During Days 3 and 4 of the APEX Hackathon, Backend 2 established the core backend database integration and shared persistence foundation for the Campus Opportunity Hub. The objectives accomplished include:

1. **Establish the Shared Backend Application Foundation:** Structure the NestJS application with clean modular boundaries for configuration, database connectivity, and user persistence.
2. **Connect to Supabase PostgreSQL:** Establish connectivity to the remote live Supabase PostgreSQL database instance.
3. **Establish Prisma ORM Layer:** Implement and validate the complete Prisma schema reflecting the authoritative 19-table physical schema without divergence.
4. **Represent the Authoritative Relational Schema:** Ensure all 19 entities, 12 enums, composite primary keys, and foreign-key integrity rules are accurately modeled.
5. **Establish the User Persistence & Role Foundation:** Implement the `public.users` repository and service to support role resolution (`STUDENT`, `ORGANIZATION`, `ADMIN`) while preserving the Supabase Auth boundary.
6. **Preserve the Supabase Auth Boundary:** Ensure no password hashes or direct credential management exist in `public.users`, delegating authentication identity strictly to `auth.users`.
7. **Deploy & Validate Remote Database:** Deploy the authoritative initial schema migration (`20260919000001_initial_schema_v2_1.sql`) to the Supabase PostgreSQL 17 instance.
8. **Conduct Security/Performance Audit & Harden Database:** Perform a live audit using Supabase Advisor and apply a dedicated hardening migration (`20260922000001_security_hardening_v2_2.sql`).

---

## 2. Backend Foundation

### 2.1 NestJS Foundation
The backend architecture is structured around NestJS modular conventions:
* **`AppModule` (`src/app.module.ts`):** Root application module coordinating configuration, Prisma data access, database health monitoring, and user persistence services.
* **`DatabaseConfig` (`src/config/database.config.ts`):** Centralized configuration loader using `@nestjs/config` for environment variable binding and connection URL management.
* **`DatabaseHealthModule` (`src/database/`):** Dedicated health check controller and service executing live database liveness queries (`SELECT 1`).

### 2.2 Supabase PostgreSQL
* **Project Reference:** `Opportunity Hub` (`pbmqdqyzsxchcgqaupxd`)
* **Database Engine:** PostgreSQL 17 (hosted on Supabase)
* **Configuration & Secrets:** Connection strings and API parameters are managed via environment variables (`DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`). No secrets or credentials are hardcoded or tracked in Git.

### 2.3 Prisma ORM
* **Schema Definition (`prisma/schema.prisma`):** Comprehensive representation of all 19 relational tables, 12 enums, and exact composite constraints.
* **Prisma Service (`src/prisma/prisma.service.ts`):** Lifecycle-managed client establishing connection pools on startup and graceful disconnects on shutdown.
* **Schema Validation:** Verified via `npx prisma validate` ensuring syntactic and relational consistency with zero schema warnings.

---

## 3. User and Authentication Boundary

The user and authentication architecture maintains a strict separation of concerns between Supabase Auth and the application database:

```text
Supabase Auth (Managed Identity)
     │
     ▼
auth.users (id UUID PK, email, encrypted passwords, auth metadata)
     │
     │ 1:1 Foreign Key (ON DELETE CASCADE)
     ▼
public.users (id UUID PK, first_name, last_name, role, is_active)
     ├── student_profiles (user_id UUID PK)
     └── organization_members (user_id UUID, organization_id UUID)
```

* **Authentication Ownership:** `auth.users` manages user credentials, password hashes, JWT generation, and session management (owned by Backend 1).
* **Application User Record:** `public.users` stores application-level profile attributes (`first_name`, `middle_name`, `last_name`, `role`, `avatar_url`, `is_active`) and links 1:1 to `auth.users(id)`.
* **Zero Credential Duplication:** No passwords, password hashes, or login secrets exist in `public.users`.
* **Platform Roles:** Typed strictly with enum `user_role` (`STUDENT`, `ORGANIZATION`, `ADMIN`).
* **Database-Level Role Escalation Guard:** Trigger `trg_users_protect_role` executing `fn_protect_user_role()` prevents non-admin users from altering their role or identity UUID.
* **Backend Boundary:** Backend 2 provides the relational database persistence foundation (`UsersRepository`, `UsersService`), while Backend 1 implements application authentication flows, registration endpoints, and session guards.

---

## 4. Database Deployment

The authoritative physical schema was deployed directly to the live Supabase PostgreSQL instance:

* **Migration Source:** `supabase/migrations/20260919000001_initial_schema_v2_1.sql`
* **Deployment Target:** Supabase Project `pbmqdqyzsxchcgqaupxd` (PostgreSQL 17)
* **Verified Database Objects:**
  * **19 Tables:** `users`, `student_profiles`, `skills`, `student_skills`, `experiences`, `cvs`, `organizations`, `organization_members`, `opportunities`, `opportunity_skills`, `saved_opportunities`, `applications`, `assessments`, `assessment_questions`, `assessment_attempts`, `assessment_answers`, `assessment_results`, `notifications`, `reports`.
  * **12 ENUM Types:** `user_role`, `org_verification_status`, `opportunity_type`, `opportunity_status`, `application_status`, `skill_requirement_level`, `experience_type`, `assessment_status`, `assessment_question_type`, `assessment_attempt_status`, `report_reason`, `report_status`.
  * **5 Custom Functions:** `fn_update_timestamp()`, `auth_user_role()`, `fn_protect_user_role()`, `is_org_member(uuid)`, `fn_validate_attempt_opportunity()`.
  * **14 Triggers:** Automated timestamp tracking, role escalation defense, and diamond integrity enforcement.
  * **47 RLS Policies:** Row Level Security active on all 19 application tables.
  * **1 Candidate Security View:** `candidate_assessment_questions` protecting answer keys and scoring rubrics.

---

## 5. Opportunity, Application, and Assessment Foundation

Backend 2 established the complete relational foundation connecting opportunities to recruitment and screening workflows:

```text
organizations ──< organization_members (1:1 MVP constraint)
      │
      └──< opportunities ──< opportunity_skills >── skills
                │
                ├──< saved_opportunities (Student bookmarks)
                ├──< applications (Student submissions)
                │         │
                │         └──< assessment_attempts (1:1 MVP constraint)
                │                   │
                │                   ├──< assessment_answers
                │                   └──── assessment_results (1:1 constraint)
                │
                └──── assessments (1:1 constraint per opportunity)
                          │
                          └──< assessment_questions
```

### Relational Integrity Highlights
1. **Application Lifecycle:** Explicit states (`SUBMITTED`, `UNDER_REVIEW`, `SHORTLISTED`, `REJECTED`, `ACCEPTED`, `WITHDRAWN`) with unique constraint `(student_profile_id, opportunity_id)`.
2. **Assessment Pipeline:** Assessments link 1:1 to opportunities. Candidates take structured tests linked to their active application.
3. **Diamond 1 Integrity Trigger:** Trigger `trg_validate_attempt_opportunity` validates that `assessment_attempts` reference an `application_id` and `assessment_id` belonging to the exact same opportunity.
4. **Diamond 2 Declarative Composite Foreign Keys:** `assessment_answers` uses composite foreign keys referencing `assessment_attempts(id, assessment_id)` and `assessment_questions(id, assessment_id)` to ensure answers cannot cross-reference questions from different assessments.
5. **Team Ownership Boundary:** Backend 2 models and maintains the relational tables, constraints, and RLS policies; Backend 3 implements the AI candidate matching, automated scoring algorithms, and admin analytics services.

---

## 6. Security and Row-Level Security (RLS) Architecture

The database security model enforces multi-tenant and role-based data isolation directly inside PostgreSQL:

* **Row Level Security (RLS):** Enabled across all 19 application tables (`relrowsecurity = true`).
* **Tenant Isolation:** Organizations can only access applicants who applied to their opportunities or discoverable students.
* **Student Data Protection:** Private CVs and non-discoverable profiles are shielded from unauthorized discovery.
* **Assessment Privacy:** Candidates cannot access `assessment_questions` directly, protecting `reference_answer` and `evaluation_guidance`.
* **Multiple Permissive Policies Review:** The 60 permissive policies flagged by linters represent intentional role/command segregation (e.g., student self-update vs. recruiter review status updates) combined through standard Postgres `OR` evaluation.

---

## 7. Supabase Advisor Audit

Following deployment, a read-only audit was conducted against Supabase Advisor:

1. **Security Category:**
   * `security_definer_view` (1 finding): `public.candidate_assessment_questions` flagged because it executes as view creator (`postgres`). Identified as an intentional architectural choice to deliver questions while denying base table SELECT access.
   * `anon_security_definer_function_executable` (5 findings): Functions callable via PostgREST `/rest/v1/rpc` anonymously.
   * `authenticated_security_definer_function_executable` (5 findings): Functions callable via PostgREST `/rest/v1/rpc` by authenticated users.
2. **Performance Category:**
   * `auth_rls_initplan` (27 findings): Policy expressions calling `auth.uid()` directly rather than `(SELECT auth.uid())`.
   * `unindexed_foreign_keys` (5 findings): Foreign key constraints on nullable override columns and junction tables lacking dedicated covering indexes.
   * `unused_index` (26 findings): Newly deployed indexes with zero scan history.

---

## 8. Security Hardening Migration (v2.2)

To address the actionable Advisor findings, a dedicated hardening migration was created and applied:

* **Migration File:** `supabase/migrations/20260922000001_security_hardening_v2_2.sql`

### 8.1 Trigger-Only Function RPC Restrictions
Execution permissions on internal trigger functions were completely revoked from `PUBLIC`, `anon`, and `authenticated`:
* `fn_protect_user_role()`
* `fn_update_timestamp()`
* `fn_validate_attempt_opportunity()`

### 8.2 RLS Helper Function Restrictions
* `auth_user_role()`: `EXECUTE` revoked from `PUBLIC` and `anon`; retained for `authenticated` (required for RLS evaluation).
* `is_org_member(uuid)`: `EXECUTE` revoked from `PUBLIC` and `anon`; retained for `authenticated` (required for RLS evaluation).

### 8.3 Candidate Assessment View Hardening
* View `candidate_assessment_questions` was hardened with `ALTER VIEW public.candidate_assessment_questions SET (security_barrier = true)`.
* `security_invoker = false` was intentionally retained to maintain `SECURITY DEFINER` delivery.
* Answer keys (`reference_answer`) and scoring rubrics (`evaluation_guidance`) remain strictly excluded from the view projection.

---

## 9. Validation and Testing

| Validation Area | Command / Method | Result | Notes |
| :--- | :--- | :--- | :--- |
| **Prisma Schema** | `npx prisma validate` | **PASS** | Valid schema loaded from `prisma/schema.prisma` |
| **Prisma Generation** | `npx prisma generate` | **PASS** | Prisma Client v6 generated successfully |
| **Unit Tests** | `npm test` | **PASS** | Health service, Prisma service, Users repository, and Users service tests |
| **Integration Tests** | `user-role-integration.spec.ts` | **PASS** | Role mapping, query verification, and entity invariants verified |
| **TypeScript Build** | `npm run build` | **PASS** | Zero type errors or compiler diagnostic issues |
| **Schema Deployment** | Supabase MCP `apply_migration` | **PASS** | Initial schema v2.1 deployed (`19` tables, `12` enums, `47` policies) |
| **Hardening Deployment** | Supabase MCP `apply_migration` | **PASS** | Hardening migration v2.2 deployed and verified |
| **Advisor Re-Check** | Supabase MCP `get_advisors` | **PASS** | Anonymous function warnings eliminated (5 $\rightarrow$ 0) |

---

## 10. Scope Isolation Audit

To guarantee clean team collaboration on the shared `main` branch, a scope isolation audit was performed:

* **Backend 2 / Shared Database:** Touched only intended database configuration, Prisma schemas, persistence repositories, and migrations.
* **Backend 1 Scope:** No authentication controllers, token handlers, or profile services were modified.
* **Backend 3 Scope:** No AI pipelines, search models, or admin controllers were modified.
* **Frontend Scope:** No frontend components, pages, or client assets were modified.
* **Working Tree:** Clean Git status with only documentation and migration assets added.

---

## 11. Files Added / Modified

| File | Purpose | Status |
| :--- | :--- | :--- |
| `prisma/schema.prisma` | Authoritative Prisma relational schema | Modified / Synced |
| `src/config/database.config.ts` | Database environment configuration module | Added |
| `src/prisma/prisma.service.ts` | Prisma Client lifecycle and connection service | Added |
| `src/prisma/prisma.module.ts` | NestJS module exporting PrismaService | Added |
| `src/database/database.health.service.ts` | PostgreSQL liveness and connectivity checker | Added |
| `src/database/database.health.controller.ts` | Health check HTTP endpoint (`/health/database`) | Added |
| `src/database/database.module.ts` | NestJS module exporting database health components | Added |
| `src/users/users.interface.ts` | User entity contracts and role definitions | Added |
| `src/users/users.repository.ts` | User persistence repository querying `public.users` | Added |
| `src/users/users.service.ts` | User domain service for role resolution | Added |
| `src/users/users.module.ts` | NestJS module exporting UsersService and UsersRepository | Added |
| `src/app.module.ts` | Root module coordinating database and user modules | Modified |
| `supabase/migrations/20260919000001_initial_schema_v2_1.sql` | Authoritative initial physical schema migration | Preserved |
| `supabase/migrations/20260922000001_security_hardening_v2_2.sql` | Security hardening migration (RPC revocation & security barrier) | Added |
| `tests/unit/database.health.service.spec.ts` | Unit tests for database health service | Added |
| `tests/unit/prisma.service.spec.ts` | Unit tests for Prisma service lifecycle | Added |
| `tests/unit/users.repository.spec.ts` | Unit tests for Users repository queries | Added |
| `tests/unit/users.service.spec.ts` | Unit tests for Users service logic | Added |
| `tests/integration/user-role-integration.spec.ts` | Integration tests verifying role queries & auth isolation | Added |
| `docs/reports/day-3-4-backend-foundation.md` | Day 3 & 4 Backend Foundation Report | Added |

---

## 12. Remaining Work

The following optimizations are documented for scheduled follow-up:

1. **RLS InitPlan Optimization (Deferred Performance Pass):** Wrap bare `auth.uid()`, `auth_user_role()`, and `is_org_member()` calls in scalar subqueries (`(SELECT auth.uid())`) across the 27 flagged policies.
2. **Foreign-Key Indexing (Deferred Performance Pass):** Add covering indexes for 5 foreign key constraints (`assessment_answers`, `assessment_results`, `reports`, `saved_opportunities`).
3. **Unused Index Monitoring:** Retain all 26 indexes as required for business constraints and production query patterns.
4. **Team Integration:** Backend 1 (Auth & Profiles) and Backend 3 (AI & Admin) can now build directly on top of the shared Prisma models and database schema.

---

## 13. Current Status

* **Database Schema:** Complete (v2.1 physical specification)
* **Supabase Deployment:** Complete (`Opportunity Hub` / `pbmqdqyzsxchcgqaupxd`)
* **Prisma Foundation:** Complete (v6 generated and validated)
* **User/Role Database Foundation:** Complete (`UsersRepository`, `UsersService`)
* **Security Hardening v2.2:** Complete (RPC access restricted, view hardened)
* **Performance Optimization:** Deferred (Non-blocking for hackathon milestones)
* **Backend 1 Integration:** Ready
* **Backend 3 Integration:** Ready
* **Frontend Integration:** Ready (Relational data model available)
