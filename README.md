# Campus Opportunity Hub

Campus Opportunity Hub is an APEX hackathon platform connecting university students with verified opportunities including internships, jobs, scholarships, hackathons, competitions, training programs, volunteer roles, and fellowships.

---

## Project Structure

Campus Opportunity Hub is developed by the APEX team across frontend and backend responsibilities:

### Backend

- **Backend 1:** Authentication, users, roles, student profiles, organization profiles
- **Backend 2:** Database architecture, opportunities, applications
- **Backend 3:** AI matching, AI-assisted assessment, voice search, admin

### Frontend

- **Frontend 1 and 2:** Student and organization-facing application interfaces

Backend responsibilities are divided by domain, while the repository, shared database, and overall system architecture are collective team artifacts.

---

## Shared Database & Architecture Assets

The project database is implemented using Supabase PostgreSQL (PostgreSQL 15+) with a hardened v2.1 physical schema featuring 19 relational tables, 12 domain ENUMs, and comprehensive Row-Level Security (RLS). Primary database architecture and schema maintenance is led by Backend 2.

- **Initial Shared Migration:** [`supabase/migrations/20260919000001_initial_schema_v2_1.sql`](supabase/migrations/20260919000001_initial_schema_v2_1.sql)
- **Physical Schema Specification:** [`docs/architecture/database-schema-physical.md`](docs/architecture/database-schema-physical.md)
- **Logical Domain Model (Day 1 v1.1):** [`docs/architecture/database-design.md`](docs/architecture/database-design.md)
- **Shared Entity-Relationship Diagram (ERD):** [`docs/architecture/assets/campus-opportunity-hub-erd.svg`](docs/architecture/assets/campus-opportunity-hub-erd.svg)
- **Documentation Index:** [`docs/README.md`](docs/README.md)

## Additional Information on the project
