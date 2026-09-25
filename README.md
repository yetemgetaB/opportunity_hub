# Campus Opportunity HUB

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

---

## 📚 Team Engineering Log

The Team Engineering Log indexes key technical reports, milestone deliverables, and major engineering documents contributed across the APEX team.

| Date | Contributor | Role | Document | Area | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 2026-09-19 | [@yetemgetaB](https://github.com/yetemgetaB) | Backend 2 | [Logical Domain Model & Database Requirements (Day 1 v1.1)](docs/architecture/database-design.md) | Architecture / Database | ✅ Complete |
| 2026-09-22 | [@yetemgetaB](https://github.com/yetemgetaB) | Backend 2 | [Day 3 & 4 Backend Foundation Report](docs/reports/day-3-4-backend-foundation.md) | Backend / Database | ✅ Complete |

### Documentation Convention

To maintain a clean and searchable documentation structure:
- **Location:** Major technical reports, milestone submissions, and architectural specifications must be stored under `docs/` (e.g., `docs/reports/`, `docs/architecture/`, `docs/backend/`).
- **Registration:** Each formal document should be registered in the **Team Engineering Log** table above.
- **Metadata Standards:**
  - **Date:** Use standard format `YYYY-MM-DD`.
  - **Contributor:** Link to the author's GitHub profile (`[@username](https://github.com/username)`).
  - **Role:** Specify team responsibility (e.g., `Backend 1`, `Backend 2`, `Backend 3`, `Frontend 1`, `Frontend 2`).
  - **Document:** Link using relative repository markdown paths.
  - **Area:** Identify the technical domain (e.g., `Architecture / Database`, `Auth / Identity`, `AI / Search`, `Frontend / UI`).
  - **Status:** Use `✅ Complete` or `🔄 In Progress`.
- **Purpose:** The README table serves as a lightweight central index; detailed contents belong in dedicated markdown documents under `docs/`.

---

## Additional Information on the project

