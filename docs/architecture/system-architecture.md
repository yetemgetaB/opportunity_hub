# System Architecture Overview

This document provides a high-level system architecture overview for the **Campus Opportunity Hub** platform, developed by the **APEX** engineering team.

---

## 1. High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                               Client Layer (Frontend)                             |
|   +------------------------------------+   +----------------------------------+   |
|   | Student Portal (Web / Mobile)      |   | Organization / Admin Dashboard   |   |
|   +------------------------------------+   +----------------------------------+   |
+------------------------------------------+----------------------------------------+
                                           | HTTPS / TLS 1.3
+------------------------------------------v----------------------------------------+
|                            Backend Services & APIs                                |
|   +---------------------------------------------------------------------------+   |
|   | Auth & User Domain [Backend 1]                                            |   |
|   |  - Authentication, user identity, roles, student & organization profiles  |   |
|   +---------------------------------------------------------------------------+   |
|   | Opportunity & Application Domain [Backend 2]                              |   |
|   |  - Opportunity lifecycle, application workflows, screening tests          |   |
|   +---------------------------------------------------------------------------+   |
|   | AI, Voice & Admin Domain [Backend 3]                                      |   |
|   |  - Semantic matching, AI assessment scoring, voice search, moderation     |   |
|   +---------------------------------------------------------------------------+   |
+------------------------------------------+----------------------------------------+
                                           | PostgREST / Supabase Client / SQL DDL
+------------------------------------------v----------------------------------------+
|                               Persistence Layer                                   |
|   +---------------------------------------------------------------------------+   |
|   | Supabase PostgreSQL Engine (Shared Physical Schema v2.1)                  |   |
|   |  - 19 Core Relational Tables & 12 ENUM Types                              |   |
|   |  - Native Row-Level Security (47 RLS Policies)                            |   |
|   |  - Automated Timestamps & Relational Guards                               |   |
|   |  - Candidate Privacy Shielding View (candidate_assessment_questions)      |   |
|   +---------------------------------------------------------------------------+   |
+-----------------------------------------------------------------------------------+
```

---

## 2. Component Overview & Team Domain Ownership

The system architecture brings together specialized backend domains and client interfaces into a cohesive platform:

| System Component | Description | Primary Domain Responsibility | Implementation Status |
| :--- | :--- | :--- | :--- |
| **Shared Database Architecture** | 19 relational tables, 12 ENUMs, database triggers, constraints, and Row-Level Security policies. | Backend 2 | **Implemented in shared schema v2.1** |
| **Shared Architecture Assets** | Visual ERD diagrams (`.svg`, `.png`) and structural diagram definition (`.json`). | Backend 2 | **Implemented & available in repository** |
| **Opportunity & Application Services** | Opportunity lifecycle management, student application workflows, and screening assessment relational foundation. | Backend 2 | **Documented & relational schema implemented** |
| **Auth & Identity Services** | Authentication flows, session handling, user identity management, and student/org profile services. | Backend 1 | *To be documented when Backend 1 integrates their work.* |
| **AI, Voice & Admin Services** | AI opportunity matching, AI assessment evaluation, voice search processing, and platform administration. | Backend 3 | *To be documented when Backend 3 integrates their work.* |
| **Client Applications** | Student web/mobile application and organization recruitment dashboard. | Frontend 1 & 2 | *To be documented when the Frontend team integrates their work.* |
