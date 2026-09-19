# Backend Architecture Overview

This document provides a comprehensive overview of the backend architecture for the **Campus Opportunity Hub**, developed by the **APEX** engineering team.

---

## 1. Team Backend Structure

Backend engineering responsibilities are divided across three specialized domains:

```text
APEX Backend Engineering
├── Backend 1: Authentication, Users, Roles, Student Profiles, Organization Profiles
├── Backend 2: Database Architecture, Opportunities, Applications, Assessment Relational Foundation
└── Backend 3: AI Matching, AI-Assisted Assessment, Voice Search, Platform Administration
```

> **Repository Status:**  
> The database architecture and the Opportunity, Application, and Assessment relational models (Backend 2 responsibility) represent the currently implemented and documented backend work in this repository. Backend 1 and Backend 3 service modules will be integrated into the shared repository as development progresses.

---

## 2. Backend 1 — Auth, Identity, & Profiles

**Primary Responsibility:** Backend 1  
**Scope:**
- **Authentication & Sessions:** Supabase Auth integration, JWT handling, token refreshes, and session lifecycle management.
- **User Identity & Roles:** Account creation, verification, and platform role foundation (`STUDENT`, `ORGANIZATION`, `ADMIN`).
- **Student Profiles:** Academic background, student credentials, and profile management services.
- **Organization Profiles:** Employer, departmental, and club profile management and organizational identity.

*Detailed implementation documentation will be added when Backend 1 integrates their work into the shared repository.*

---

## 3. Backend 2 — Database, Opportunities, Applications, & Relational Foundation

**Primary Responsibility:** Backend 2  
**Scope:**  
This section details the currently implemented and documented backend persistence layer and domain logic for Opportunities, Applications, and the screening assessment database foundation.

### 3.1 Shared Database Architecture & Persistence
- Single source of truth: PostgreSQL 15+ hosted on Supabase (`supabase/migrations/20260919000001_initial_schema_v2_1.sql`).
- Hardened schema with 19 relational tables, 12 domain ENUMs, check constraints, foreign keys, and 47 RLS policies.
- Full physical specification: [`docs/architecture/database-schema-physical.md`](../architecture/database-schema-physical.md).

### 3.2 Opportunity Domain
- **Entity:** `opportunities` (PK: `id UUID`, FK: `organization_id UUID REFERENCES organizations(id) ON DELETE RESTRICT`).
- **Opportunity Types:** Defined by `opportunity_type` ENUM:
  `INTERNSHIP`, `JOB`, `SCHOLARSHIP`, `HACKATHON`, `COMPETITION`, `TRAINING`, `VOLUNTEER`, `FELLOWSHIP`, `OTHER`.
- **Lifecycle Management:** Governed by `opportunity_status` ENUM:
  - `DRAFT`: Initial creation by organization members; visible only to the owning organization.
  - `PENDING_APPROVAL`: Submitted by organization for administrative verification.
  - `PUBLISHED`: Active and discoverable by students; accepting applications if before `application_deadline`.
  - `CLOSED`: Past deadline or manually closed; read-only for audit and historical tracking.
  - `REJECTED`: Declined during administrative review.
- **Eligibility Criteria & Constraints:**
  - Academic level: `minimum_academic_year INTEGER` (`CHECK (minimum_academic_year BETWEEN 1 AND 7)`).
  - Minimum GPA: `minimum_gpa NUMERIC(3,2)` (`CHECK (minimum_gpa >= 0.00 AND minimum_gpa <= 4.00)`).
  - Academic disciplines: `eligible_fields_of_study TEXT[]` (array of permitted majors).
  - Work arrangements: `location TEXT`, `is_remote BOOLEAN NOT NULL DEFAULT false`.
  - Timeline: `application_deadline TIMESTAMPTZ` (must be future-dated on publication).
  - Financial transparency: `compensation_details TEXT`.
  - External postings: `external_url TEXT` for opportunities handled on third-party portals.
- **Opportunity Skills:** Mapped via junction table `opportunity_skills` (`opportunity_id`, `skill_id`) with `requirement_level` ENUM (`REQUIRED`, `PREFERRED`).
- **Indexing Strategy:**
  - `idx_opportunities_discovery`: Composite partial index on `(status, opportunity_type, application_deadline) WHERE deleted_at IS NULL`.
  - `idx_opportunities_org_status`: Partial index on `(organization_id, status) WHERE deleted_at IS NULL`.

### 3.3 Application Domain
- **Entity:** `applications` (PK: `id UUID`, FKs: `opportunity_id`, `student_profile_id`, `cv_id`).
- **Single Application Invariant:** Enforced at database level via `CONSTRAINT uq_applications_student_opportunity UNIQUE (opportunity_id, student_profile_id)`.
- **Application Lifecycle:** Governed by `application_status` ENUM:
  - `SUBMITTED`: Applied by student; pending review.
  - `UNDER_REVIEW`: Recruiter / organization member is actively reviewing applicant qualifications.
  - `SHORTLISTED`: Candidate advanced to the interview or shortlisted stage.
  - `REJECTED`: Candidate not selected.
  - `ACCEPTED`: Candidate selected for the position/award.
  - `WITHDRAWN`: Candidate voluntarily retracted their submission (permitted while `SUBMITTED` or `UNDER_REVIEW`).
- **Audit Tracking:** Stores `applied_at TIMESTAMPTZ NOT NULL DEFAULT now()` and `updated_at`. Applications cannot be hard-deleted if referenced by ongoing assessments (`ON DELETE RESTRICT`).
- **Indexing:**
  - `idx_applications_student`: Index on `student_profile_id` for candidate application tracking.
  - `idx_applications_opp_status`: Composite index on `(opportunity_id, status)` for employer review pipelines.

### 3.4 Screening Assessment Relational Foundation (Shared with Backend 3)
Backend 2 established the relational architecture for opportunity-scoped assessments, while Backend 3 provides the AI generation and evaluation logic:

```text
Opportunity (Backend 2)
    ↓ (1:1 optional, UNIQUE(opportunity_id))
Assessment (Backend 2 Schema / Backend 3 AI Logic)
    ↓ (1:N questions, options JSONB)
Application (Backend 2)
    ↓ (1:1 in MVP, UNIQUE(application_id))
AssessmentAttempt (Backend 2 Schema / Backend 3 AI Logic)
    ↓ (1:N answers)
AssessmentAnswer (Backend 2 Schema / Backend 3 AI Logic)
    ↓ (1:1)
AssessmentResult (Backend 2 Schema / Backend 3 AI Scoring)
```

- **MVP Attempt Constraint:** Strictly one attempt per application enforced via `CONSTRAINT uq_assessment_attempts_app UNIQUE (application_id)`.
- **Diamond Integrity Validation:** Trigger `trg_validate_attempt_opportunity` executes `fn_validate_attempt_opportunity()` ensuring that `application.opportunity_id == assessment.opportunity_id`.
- **Question Options Format:** Multiple-choice options are stored within `assessment_questions.options JSONB` validated by `chk_questions_mcq_options`.
- **Candidate Privacy View:** The security-definer view `candidate_assessment_questions` projects safe question attributes to applicants while concealing `reference_answer` and `evaluation_guidance`.

---

## 4. Backend 3 — AI, Scoring, Voice, & Admin

**Primary Responsibility:** Backend 3  
**Scope:**
- **AI Matching Engine:** Semantic student-opportunity matching using skill vectors, academic criteria, and profile history.
- **AI-Assisted Assessment:** Automated scoring rubrics, question generation assistance, and natural language answer evaluation (`assessment_answers` → `assessment_results`).
- **Voice Search:** Audio transcription, intent recognition, and voice-driven query dispatching.
- **Platform Administration:** Administrative moderation workflows (`reports` review and resolution), verification of new organizations, and platform governance.

*Detailed implementation documentation will be added when Backend 3 integrates their work into the shared repository.*
