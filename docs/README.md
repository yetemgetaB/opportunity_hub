# Campus Opportunity Hub Documentation

Welcome to the central documentation repository for the **Campus Opportunity Hub** project, developed collectively by the **APEX** engineering team.

This documentation directory contains the shared architecture, database specifications, backend domain overviews, API conventions, security governance, architectural decisions, and formal project deliverables.

---

## Team Responsibility Overview

While the repository and overall system architecture are shared team assets, engineering responsibilities are organized across specialized domains:

| Role | Primary Domain Responsibilities | Current Documentation / Implementation Status |
| :--- | :--- | :--- |
| **Backend 1** | Authentication, user identity, roles foundation, student profiles, organization profiles. | *Architecture defined; detailed service implementation to be integrated by Backend 1.* |
| **Backend 2** | Database architecture & PostgreSQL schema, shared ERD, Opportunity module & lifecycle, Application module & lifecycle, Opportunity ↔ Application ↔ Assessment relational foundation. | **Implemented in shared schema v2.1 and documented.** |
| **Backend 3** | AI candidate-opportunity matching, AI-assisted applicant assessment, voice search, admin workflows. | *Architecture defined; detailed service implementation to be integrated by Backend 3.* |
| **Frontend 1 & 2** | Student portal UI, organization recruitment dashboard, client application interfaces. | *Client application implementation to be integrated by Frontend team.* |

---

## Documentation Index

Documentation is organized by architectural concern rather than personal ownership:

### 1. Architecture & Database Design
- [Logical Domain Model & Database Requirements (Day 1 v1.1)](architecture/database-design.md) — Comprehensive entity definitions, domain rules, relationship cardinality, and lifecycle flows.
- [Physical Database Schema Specification (v2.1)](architecture/database-schema-physical.md) — Complete Supabase PostgreSQL production schema, 19-table DDL specification, data types, constraints, index coverage, and RLS rules.
- [System Architecture Overview](architecture/system-architecture.md) — Shared high-level system architecture and component interactions.
- [Shared Architecture Assets](architecture/assets/) — Visual and structural ERD assets:
  - [campus-opportunity-hub-erd.svg](architecture/assets/campus-opportunity-hub-erd.svg) (Scalable Vector Graphic ERD)
  - [campus-opportunity-hub-erd.png](architecture/assets/campus-opportunity-hub-erd.png) (High-resolution PNG ERD)
  - [campus-opportunity-hub-diagram.json](architecture/assets/campus-opportunity-hub-diagram.json) (Machine-readable diagram schema)

### 2. Backend & Shared Database Migrations
- [Backend Overview](backend/backend-overview.md) — Shared backend architecture, module boundaries across Backends 1, 2, and 3, and detailed workflows for Opportunities, Applications, and Assessments.
- [Initial Shared Migration (v2.1)](../supabase/migrations/20260919000001_initial_schema_v2_1.sql) — Authoritative executable PostgreSQL DDL for Supabase (maintained by Backend 2).

### 3. Security & Governance
- [Permissions & Row-Level Security Matrix](security/permissions.md) — Database-level RLS policies, security-definer helper functions, candidate assessment privacy shielding, and team security boundaries.

### 4. Technical Architecture Decisions
- [Architecture Decision Records (ADRs)](decisions/architecture-decisions.md) — Finalized architectural decisions established during database modeling (UUID PKs, 12 ENUMs, JSONB assessment options, exclusive ARC report targets, targeted soft delete).

### 5. API Conventions
- [API Conventions & Guidelines](api/api-conventions.md) — Shared team standards for RESTful protocols, JSON response envelopes, authentication expectations, and error structures.

### 6. Formal Milestone Deliverables
- [Campus-Opportunity-Hub-Database-Design-Final.docx](deliverables/Campus-Opportunity-Hub-Database-Design-Final.docx) — Audited Release v2.1 formal database design deliverable prepared for the hackathon milestone.
- [Campus-Opportunity-Hub-Database-Design-Day1-v1.1.docx](deliverables/Campus-Opportunity-Hub-Database-Design-Day1-v1.1.docx) — Day 1 Architecture Milestone submission deliverable.
