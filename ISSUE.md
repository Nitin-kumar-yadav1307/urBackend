---
name: Feature – Project Configuration Change Log
about: Track all project-level settings changes with a full audit trail (who, what, when)
title: "feat: Project Configuration Change Log (Audit Trail)"
labels: enhancement, audit, dashboard
assignees: ''
---

## Summary

As a developer using urBackend, I need a way to see a **full audit trail of every configuration change** made to my project — including who made the change, what setting was changed, and when it happened.

This is critical for team projects where multiple members have admin access, and essential for debugging unexpected behavior caused by a settings change.

---

## Problem

Currently, there is **no way to know**:
- Who changed the project's allowed domains, auth settings, or RLS rules
- When the BYOD database/storage configuration was last updated
- Whether a team member enabled/disabled authentication or OAuth providers

This makes it extremely difficult to audit changes in team environments and trace the root cause of behavioral regressions.

---

## Proposed Solution

Implement a **Project Config Change Log** system with the following components:

### 1. New MongoDB Model — `ProjectConfigLog`

Store an audit entry every time a project-level setting is mutated.

**Schema fields:**

| Field | Type | Description |
|-------|------|-------------|
| `projectId` | ObjectId | Reference to the affected project |
| `changedBy` | ObjectId | Reference to the developer who made the change |
| `changedByEmail` | String | Denormalized email (for display even if account is deleted) |
| `category` | String | Category of the change (see table below) |
| `label` | String | Human-readable description of the change |
| `diff` | Mixed | Array of `{ field, from, to }` objects (sensitive values masked) |
| `changedAt` | Date | Timestamp of the change |

**Categories:**

| Category | Trigger |
|---|---|
| `project_info` | Name, siteUrl, or resendFromEmail updated |
| `api_key` | Publishable or secret API key regenerated |
| `auth` | `isAuthEnabled` toggled |
| `public_signup` | `allowPublicSignup` toggled |
| `auth_providers` | GitHub/Google OAuth providers updated |
| `allowed_domains` | CORS allowed domains list changed |
| `byod_db` | External MongoDB URI configured |
| `byod_storage` | External storage (Supabase/S3/R2/GCS) configured |
| `collection_schema` | Collection schema added or updated |
| `collection_rls` | Row-Level Security rules changed on a collection |
| `mail_template` | Mail template created, updated, or deleted |
| `resend` | Resend API key updated |
| `member` | Team member invited, role changed, or removed |

### 2. New API Endpoint

```http
GET /api/projects/:projectId/config-logs
```

**Access:** Any project member (admin or viewer)

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number (1-indexed) |
| `limit` | number | 30 | Items per page (max 100) |
| `category` | string | — | Filter by category |

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "...",
        "projectId": "...",
        "changedBy": "...",
        "changedByEmail": "dev@example.com",
        "category": "auth",
        "label": "Authentication enabled",
        "diff": [{ "field": "isAuthEnabled", "to": true }],
        "changedAt": "2026-07-31T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 30,
      "total": 42,
      "totalPages": 2
    }
  },
  "message": "Configuration change logs retrieved successfully."
}
```

### 3. Dashboard UI Page

A new **"Config History"** tab (or page) in the web-dashboard for each project showing the log entries in a clear, scannable timeline format.

---

## Instrumented Actions (Phase 1)

The following controller functions should write a log entry on success:

- [x] `updateProject` — name, siteUrl, resendFromEmail, resendApiKey
- [x] `toggleAuth` — isAuthEnabled toggle
- [x] `togglePublicSignup` — allowPublicSignup toggle
- [x] `updateAuthProviders` — GitHub/Google OAuth config
- [x] `updateAllowedDomains` — CORS allowed domains
- [x] `updateExternalConfig` — BYOD DB / storage config
- [x] `updateCollectionRls` — per-collection RLS settings
- [ ] `regenerateApiKey` — API key rotation (Phase 2)
- [ ] `createCollection` / `deleteCollection` — schema changes (Phase 2)
- [ ] `createMailTemplate` / `updateMailTemplate` / `deleteMailTemplate` (Phase 2)
- [ ] `inviteMember` / `updateMemberRole` / `removeMember` (Phase 2)

---

## Security & Privacy

- **No sensitive values are stored in plain text.** All secrets (API keys, DB URIs, client secrets) are masked with `••••••••` in the `diff` field.
- The `changedByEmail` is denormalized at write time to prevent data loss if a developer account is deleted.
- Config logs are **read-only** — there is no API to delete or modify them.

---

## Implementation Notes

- The `logConfigChange` helper is designed to **never throw** — a logging failure will only produce a `console.error` and will not affect the primary API response.
- Logs are indexed on `(projectId, changedAt)` for efficient paginated queries.
- The model lives in `packages/common/src/models/ProjectConfigLog.js` and is exported from `@urbackend/common`.

---

## Acceptance Criteria

- [ ] All Phase 1 config mutations write a `ProjectConfigLog` document
- [ ] `GET /api/projects/:projectId/config-logs` returns paginated logs correctly
- [ ] Logs are filterable by `category`
- [ ] No sensitive value (key, URI, secret) is stored in plaintext in the log
- [ ] A logging failure does not affect the primary mutation response
- [ ] Any project member (admin or viewer) can read the log
- [ ] A "Config History" UI page is visible in the web-dashboard per project
