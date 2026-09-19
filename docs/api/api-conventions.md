# Shared API Conventions & Guidelines

This document establishes the shared protocol standards and request/response guidelines across the **APEX** engineering team for the **Campus Opportunity Hub**.

Specific endpoints for each domain will be documented as the responsible backend members integrate their respective services into the shared repository.

---

## 1. Domain Routing & Ownership

| API Domain | Responsible Role | Implementation Status |
| :--- | :--- | :--- |
| **Auth & Session Endpoints** | Backend 1 | *To be documented when Backend 1 integrates their work.* |
| **User & Profile Endpoints** | Backend 1 | *To be documented when Backend 1 integrates their work.* |
| **Opportunity Endpoints** | Backend 2 | *To be documented when Backend 2 integrates API routes.* |
| **Application Endpoints** | Backend 2 | *To be documented when Backend 2 integrates API routes.* |
| **AI Matching & Assessment Scoring** | Backend 3 | *To be documented when Backend 3 integrates their work.* |
| **Voice Search Endpoints** | Backend 3 | *To be documented when Backend 3 integrates their work.* |
| **Admin & Moderation Endpoints** | Backend 3 | *To be documented when Backend 3 integrates their work.* |

---

## 2. Shared Protocol Standards

- **Transport:** HTTPS exclusively with TLS 1.3 enforced.
- **Content-Type:** `application/json; charset=utf-8` for all request and response bodies.
- **Base Path Convention:** `/api/v1/` for custom serverless/edge functions, alongside direct Supabase PostgREST endpoints (`/rest/v1/`).
- **Authentication:** All protected endpoints require a valid Supabase JWT Bearer token:
  ```http
  Authorization: Bearer <access_token>
  ```

---

## 3. Shared Response Envelopes

To maintain consistency between all backend services and client applications, the following envelope conventions are recommended:

### Success Response Envelope
```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2026-09-19T22:00:00Z"
  }
}
```

### Error Response Envelope
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human-readable explanation of the error",
    "details": []
  },
  "meta": {
    "timestamp": "2026-09-19T22:00:00Z"
  }
}
```

---

## 4. Specific Endpoint Documentation

Specific endpoint parameters, request payloads, and response models will be added to this section as each backend member develops and integrates their domain APIs into the shared repository.
