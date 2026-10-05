# Frontend Demo Mode

The frontend currently runs with a local demo service while backend integration is pending. Demo accounts, the current session, opportunities, applications, saved items, profiles, notifications, and assessment submissions are stored in browser `localStorage` (with an in-memory fallback when browser storage is unavailable).

Start the frontend from this directory:

```sh
npm install
npm run dev
```

Demo sign-in credentials:

| Role | Email | Password |
| --- | --- | --- |
| Student | `demo.student@opportunityhub.test` | `StudentDemo2026!` |
| Organization | `demo.organization@opportunityhub.test` | `OrganizationDemo2026!` |

Newly registered accounts are also available locally in the browser used to register them. Clearing site storage resets local demo data.