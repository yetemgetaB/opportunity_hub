# Security, Permissions, & Row-Level Security Matrix

Security in the **Campus Opportunity Hub** is a shared system concern across the **APEX** engineering team.

> **Team Security Context:**  
> Backend 2 implemented and documented the **database-level Row-Level Security (RLS) architecture** represented in this document as part of the shared schema v2.1 deliverable. Authentication/session-level security will be integrated by **Backend 1**, while administrative governance and AI service authentication will be integrated by **Backend 3**.

---

## 1. Security Architecture Across Domains

| Security Domain | Scope & Responsibility | Primary Role | Status |
| :--- | :--- | :--- | :--- |
| **Authentication & Sessions** | Supabase Auth, JWT validation, token refresh, account lockout, session revocation. | Backend 1 | **Implemented in NestJS Auth Foundation** |
| **Database Row-Level Security** | PostgreSQL RLS policies across all 19 tables, database constraints, helper functions, candidate privacy views. | Backend 2 | **Implemented in shared schema v2.1** |
| **Platform Moderation & AI Auth** | Admin privileges, AI execution credentials, voice API tokens, report resolution workflows. | Backend 3 | *To be documented when Backend 3 integrates their work.* |

---

## 2. API Authorization & Database Security Boundary (Model A Architecture)

1. **Public Registration Role Scope:** Public registration accepts only `STUDENT` and `ORGANIZATION`.
2. **ADMIN Self-Registration Prevention:** `ADMIN` cannot be self-registered through the NestJS public registration endpoint (`POST /api/v1/auth/register`).
3. **Primary Authorization Boundary:** NestJS guards, DTOs, and controller checks serve as the primary authorization boundary for all Prisma-backed API requests.
4. **Prisma Privileged Connection:** Prisma connects to PostgreSQL using the privileged `postgres` superuser/owner role (`rolbypassrls = true`), which bypasses PostgreSQL Row-Level Security (RLS).
5. **Database Trigger Scope:** Database trigger `trg_users_protect_role` enforces role protection for direct PostgREST sessions, but because `auth.uid()` is `NULL` during Prisma queries, it does not independently distinguish privileged Prisma `INSERT` operations.
6. **ADMIN Account Provisioning:** `ADMIN` accounts must currently be provisioned through a trusted administrative or database seed process.
7. **Future Scope:** Caller-aware database authorization (propagating JWT claims into PostgreSQL sessions) may be evaluated in future iterations but is out of scope for the current architecture.

---

## 3. Database Security Functions (Shared Schema v2.1)

The shared schema implements security-definer helper functions to execute permission checks cleanly without recursive RLS lookups:

### `auth_user_role()`
- **Implementation:** `STABLE SECURITY DEFINER` with `SET search_path = public, pg_temp;`
- **Behavior:** Queries `SELECT role FROM users WHERE id = auth.uid() AND deleted_at IS NULL;`.
- **Purpose:** Resolves the caller's role (`STUDENT`, `ORGANIZATION`, `ADMIN`) safely for RLS policy evaluation.

### `is_org_member(org_id UUID)`
- **Implementation:** `STABLE SECURITY DEFINER` with `SET search_path = public, pg_temp;`
- **Behavior:** Checks `SELECT EXISTS (SELECT 1 FROM organization_members WHERE organization_id = org_id AND user_id = auth.uid());`.
- **Purpose:** Verifies organization membership for opportunity and application operations.

### `fn_validate_attempt_opportunity()` (Diamond Integrity Guard)
- **Implementation:** Trigger function executed `BEFORE INSERT OR UPDATE ON assessment_attempts`.
- **Security Invariant:** Validates that `application.opportunity_id == assessment.opportunity_id`, preventing cross-opportunity tampering or attempt injection.

---

## 4. Row-Level Security Matrix (Shared Database v2.1)

Row-Level Security is enabled on all 19 database tables (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`).

### Opportunity Domain (Backend 2 Responsibility)
- **`opportunities`:**
  - `opportunities_select`: Authenticated students can discover published, non-deleted opportunities (`status = 'PUBLISHED' AND deleted_at IS NULL`). Organization members view all postings belonging to their organization. Platform admins view all.
  - `opportunities_insert_member`: Organization members can create new opportunities for their organization (`is_org_member(organization_id)`).
  - `opportunities_update_member`: Organization members can update postings for their organization.
  - `opportunities_delete_member`: Organization members can soft-delete postings (`deleted_at = now()`).
- **`opportunity_skills`:** Inherits discovery visibility from parent opportunity; managed by owning organization members.
- **`saved_opportunities`:** Students manage only their own bookmarks (`student_profile_id = auth.uid()`).

### Application Domain (Backend 2 Responsibility)
- **`applications`:**
  - `applications_select`: Students view only their own applications (`student_profile_id = auth.uid()`). Organization members view applications submitted to their opportunities. Admins view all.
  - `applications_insert_student`: Students submit applications to published opportunities before deadline. Unique constraint (`uq_applications_student_opportunity`) prevents duplicates.
  - `applications_update_student_withdraw`: Students can transition their application to `WITHDRAWN` while in `SUBMITTED` or `UNDER_REVIEW` status.
  - `applications_update_org_admin`: Organization members advance candidate review status (`UNDER_REVIEW`, `SHORTLISTED`, `ACCEPTED`, `REJECTED`).

### Screening Assessment Domain (Relational Access)
- **Candidate Privacy View (`candidate_assessment_questions`):** The base table `assessment_questions` is restricted to organization members and admins. Candidates access questions exclusively through this view, which omits `reference_answer` and `evaluation_guidance`.
- **`assessment_attempts`:** Students can initiate an attempt for their own active application (strictly one attempt in MVP: `UNIQUE(application_id)`). Reviewing organization members can inspect candidate attempts.
- **`assessment_answers`:** Candidates insert and update answers while the attempt is `IN_PROGRESS`.
- **`assessment_results`:** Candidates can view published results; evaluators (organization recruiters or Backend 3 AI evaluation services) record scores and feedback.

### Identity & Profiles (Backend 1 Responsibility)
- **`users`:** Read access for authenticated users (`users_select`), registration self-insert (`users_insert_self`), and non-role profile update (`users_update_self`). Trigger `trg_users_protect_role` prevents non-admins from altering user roles.
- **`student_profiles`:** Discoverable student profiles are viewable by organizations; write operations are restricted strictly to `user_id = auth.uid()`.
- **`experiences` & `cvs`:** Scoped strictly to the owning student, with read access granted to reviewing organizations for active applicants.
- **`organizations` & `organization_members`:** Approved organizations are public; organization members manage profile updates.

### Moderation & Operations (Backend 3 Responsibility)
- **`reports`:** Users can file moderation reports (`reports_insert_user`) and view their own reports (`reports_select`). Platform admins view all reports and manage resolution (`reports_admin_update`).
- **`notifications`:** Users manage only their own in-app notifications (`recipient_id = auth.uid()`).
