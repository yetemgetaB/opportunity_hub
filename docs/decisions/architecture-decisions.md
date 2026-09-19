# Architecture Decision Records (ADRs)

This document records the foundational architectural decisions established for the **Campus Opportunity Hub** during the database architecture and relational modeling process.

> **Team Architecture Context:**  
> These decisions represent shared project architecture agreed upon during the database modeling phase. Implementation and schema maintenance are led by **Backend 2**.  
> Decisions regarding Authentication & Session Architecture belong to **Backend 1**, while decisions regarding AI Matching, Assessment Intelligence, Voice Search, and Admin Operations belong to **Backend 3**.

---

## Index of Shared Database Architecture Decisions

- [ADR-001: UUID v4 for Primary Keys](#adr-001-uuid-v4-for-primary-keys)
- [ADR-002: PostgreSQL ENUM Types for Domain Vocabularies](#adr-002-postgresql-enum-types-for-domain-vocabularies)
- [ADR-003: Snake_case Database Naming Standards](#adr-003-snake_case-database-naming-standards)
- [ADR-004: Single Platform Role per User for MVP](#adr-004-single-platform-role-per-user-for-mvp)
- [ADR-005: Targeted Soft Deletion with Partial Indexing](#adr-005-targeted-soft-deletion-with-partial-indexing)
- [ADR-006: Student Profile as 1:1 Primary Key Extension of Users](#adr-006-student-profile-as-11-primary-key-extension-of-users)
- [ADR-007: Multiple CVs with Default Flag](#adr-007-multiple-cvs-with-default-flag)
- [ADR-008: Single Member per Organization in MVP](#adr-008-single-member-per-organization-in-mvp)
- [ADR-009: Opportunity and Application Relationship Invariants](#adr-009-opportunity-and-application-relationship-invariants)
- [ADR-010: Single Assessment Attempt per Application](#adr-010-single-assessment-attempt-per-application)
- [ADR-011: Assessment Question Options Stored as JSONB](#adr-011-assessment-question-options-stored-as-jsonb)
- [ADR-012: Candidate-Safe Assessment Question Projection View](#adr-012-candidate-safe-assessment-question-projection-view)
- [ADR-013: Exclusive Foreign-Key ARC for Moderation Reports](#adr-013-exclusive-foreign-key-arc-for-moderation-reports)
- [ADR-014: Selective Cascade vs. Restrict Referential Deletion Behavior](#adr-014-selective-cascade-vs-restrict-referential-deletion-behavior)
- [ADR-015: Row-Level Security with Security-Definer Helper Functions](#adr-015-row-level-security-with-security-definer-helper-functions)

---

### ADR-001: UUID v4 for Primary Keys
- **Status:** Finalized (v2.1)
- **Implementation Responsibility:** Backend 2
- **Context:** Entity identifiers must be secure against sequential enumeration and predictable harvesting while supporting client/distributed generation.
- **Decision:** Use UUID (`DEFAULT gen_random_uuid()`) for all entity primary keys.
- **Consequences:** Prevents enumeration attacks and simplifies cross-service integration; requires 16-byte storage per ID, offset by B-tree index efficiency in PostgreSQL.

---

### ADR-002: PostgreSQL ENUM Types for Domain Vocabularies
- **Status:** Finalized (v2.1)
- **Implementation Responsibility:** Backend 2
- **Context:** Closed domain states (e.g. `application_status`, `opportunity_type`) require strong compile-time and runtime integrity checks.
- **Decision:** Use 12 native PostgreSQL ENUM types (`user_role`, `org_verification_status`, `opportunity_type`, `opportunity_status`, `application_status`, `skill_requirement_level`, `experience_type`, `assessment_status`, `assessment_question_type`, `assessment_attempt_status`, `report_reason`, `report_status`).
- **Consequences:** Provides type safety at 4 bytes per value; schema changes to enums require `ALTER TYPE ... ADD VALUE`.

---

### ADR-003: Snake_case Database Naming Standards
- **Status:** Finalized (v2.1)
- **Implementation Responsibility:** Backend 2
- **Context:** PostgreSQL folds unquoted identifiers to lowercase.
- **Decision:** Strictly enforce `snake_case` naming for tables, columns, indexes, constraints, triggers, and functions.
- **Consequences:** Eliminates case-sensitivity issues and quoted identifier boilerplate across all client queries.

---

### ADR-004: Single Platform Role per User for MVP
- **Status:** Finalized (v2.1)
- **Implementation Responsibility:** Shared (Backend 1 / Backend 2)
- **Context:** Multi-role complexity (e.g. a user acting simultaneously as both Student and Employer) complicates authorization rules in an MVP.
- **Decision:** Each user is assigned exactly one platform role (`STUDENT`, `ORGANIZATION`, `ADMIN`) stored in `users.role`.
- **Future Possibility:** Multi-role or tenant-scoped RBAC can be evaluated in post-MVP releases via a junction role table (Backend 1 responsibility).

---

### ADR-005: Targeted Soft Deletion with Partial Indexing
- **Status:** Finalized (v2.1)
- **Implementation Responsibility:** Backend 2
- **Context:** Hard deletion of organizations, opportunities, or user accounts cascades destructively into historical applications and audit trails.
- **Decision:** Implement `deleted_at TIMESTAMPTZ NULL` selectively on three high-value business entities: `users`, `organizations`, and `opportunities`. Accompany these with partial B-tree indexes (`WHERE deleted_at IS NULL`).
- **Consequences:** Historical records remain intact; active query scans remain fast via partial index exclusion.

---

### ADR-006: Student Profile as 1:1 Primary Key Extension of Users
- **Status:** Finalized (v2.1)
- **Implementation Responsibility:** Shared (Backend 1 / Backend 2)
- **Context:** Student-specific fields (e.g., `institution_name`, `field_of_study`, `gpa`) do not apply to organization accounts.
- **Decision:** Model `student_profiles` as a 1:1 table inheriting `users.id` directly as its primary key (`user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE`).
- **Consequences:** Clean separation of general identity from academic profile without redundant surrogate keys.

---

### ADR-007: Multiple CVs with Default Flag
- **Status:** Finalized (v2.1)
- **Implementation Responsibility:** Shared (Backend 1 / Backend 2)
- **Context:** Students need to upload different resumes tailored to different opportunity types.
- **Decision:** Allow multiple records in `cvs` per student, with an `is_default BOOLEAN DEFAULT false` column.
- **Consequences:** Provides candidate flexibility during application submission.

---

### ADR-008: Single Member per Organization in MVP
- **Status:** Finalized (v2.1)
- **Implementation Responsibility:** Shared (Backend 1 / Backend 2)
- **Context:** Team-based organization access requires invite workflows, seat management, and member role hierarchies.
- **Decision:** Model membership via junction `organization_members (organization_id, user_id)` with a unique constraint `CONSTRAINT uq_org_members_single_member_mvp UNIQUE (organization_id)`.
- **Consequences:** Limits organizations to a single administrator in MVP; allows seamless migration to multi-member organizations in the future simply by dropping the unique constraint.

---

### ADR-009: Opportunity and Application Relationship Invariants
- **Status:** Finalized (v2.1)
- **Implementation Responsibility:** Backend 2
- **Context:** Duplicate applications create noise and complicate candidate evaluation.
- **Decision:** Enforce `CONSTRAINT uq_applications_student_opportunity UNIQUE (opportunity_id, student_profile_id)`.
- **Consequences:** A student can apply at most once per opportunity.

---

### ADR-010: Single Assessment Attempt per Application
- **Status:** Finalized (v2.1)
- **Implementation Responsibility:** Shared (Backend 2 / Backend 3)
- **Context:** Competitive opportunity screening requires fair, deterministic evaluation without retake advantages.
- **Decision:** Bind `assessment_attempts` directly to `application_id` with `CONSTRAINT uq_assessment_attempts_app UNIQUE (application_id)`.
- **Consequences:** Guarantees strictly one screening assessment attempt per application in the MVP.

---

### ADR-011: Assessment Question Options Stored as JSONB
- **Status:** Finalized (v2.1)
- **Implementation Responsibility:** Shared (Backend 2 / Backend 3)
- **Context:** Multiple-choice options can be represented via a normalized table (`assessment_option`) or embedded JSONB within `assessment_questions`.
- **Decision:** Store options as `options JSONB NULL` on `assessment_questions`, validated by `CONSTRAINT chk_questions_mcq_options`.
- **Rationale:** Multiple-choice options are atomic to their parent question and never referenced independently by other entities. Embedding them avoids high-churn relational joins and simplifies question delivery.
- **Consequences:** Eliminates an extra physical table (`assessment_option`); keeps the physical model at a clean 19 tables.

---

### ADR-012: Candidate-Safe Assessment Question Projection View
- **Status:** Finalized (v2.1)
- **Implementation Responsibility:** Shared (Backend 2 / Backend 3)
- **Context:** `assessment_questions` contains `reference_answer` and `evaluation_guidance`. Candidates must not see these fields.
- **Decision:** Restrict `assessment_questions` base table via RLS to organization members and admins. Expose candidate questions strictly through a security-definer view `candidate_assessment_questions` which omits sensitive columns and filters by active student application.
- **Consequences:** Prevents assessment answer leaks while allowing straightforward client queries for candidates.

---

### ADR-013: Exclusive Foreign-Key ARC for Moderation Reports
- **Status:** Finalized (v2.1)
- **Implementation Responsibility:** Shared (Backend 2 / Backend 3)
- **Context:** Moderation reports can target an Opportunity, an Organization, or a User.
- **Decision:** Use three explicit nullable foreign keys (`reported_opportunity_id`, `reported_organization_id`, `reported_user_id`) governed by `CONSTRAINT chk_reports_exclusive_target CHECK (num_nonnulls(...) = 1)`.
- **Rationale:** Avoids "polymorphic association" anti-patterns, preserves full relational integrity, and ensures referential checks work natively.

---

### ADR-014: Selective Cascade vs. Restrict Referential Deletion Behavior
- **Status:** Finalized (v2.1)
- **Implementation Responsibility:** Backend 2
- **Context:** Accidental deletions should not orphan operational data or wipe legal/audit trails.
- **Decision:**
  - `ON DELETE CASCADE`: Used for tightly-coupled dependent child rows (`student_skills`, `opportunity_skills`, `assessment_questions`, `assessment_answers`, `notifications`).
  - `ON DELETE RESTRICT`: Used for audit boundaries (deleting an organization with active opportunities, deleting an opportunity with submitted applications, deleting a candidate attempt linked to results).

---

### ADR-015: Row-Level Security with Security-Definer Helper Functions
- **Status:** Finalized (v2.1)
- **Implementation Responsibility:** Backend 2
- **Context:** Complex RLS subqueries in PostgreSQL can cause circular recursive policy evaluation and poor performance.
- **Decision:** Encapsulate common authorization checks into `SECURITY DEFINER` helper functions (`auth_user_role()`, `is_org_member(org_id)`) with pinned `search_path = public, pg_temp;`.
- **Consequences:** Clean, maintainable RLS policies without circular evaluation or privilege escalation vulnerabilities.
