# Agent Maple Console

The official management console for **Agent Maple**.

## Project Setup

This project is built with **Vite + React**.

### Prerequisites
- Node.js v20.19+ (Managed via `mise` is recommended)

### Tooling (mise)
This repo ships a `.tool-versions` file. If you use `mise`, run:

```bash
mise install
```

### Development

```bash
npm install
npm run dev
```

### Environment

Local development can still use Vite `VITE_*` variables:

```bash
VITE_API_URL=https://api.stage.certly.jambr.ca
```

For Railway/runtime deployments, app config is read from `/env.js` (served by `server.js`) so the same image can be promoted across environments.

Runtime keys supported:
- `API_URL`
- `AWS_REGION`
- `COGNITO_USER_POOL_ID`
- `COGNITO_APP_CLIENT_ID`
- `SENTRY_DSN`
- `GIT_COMMIT` (recommended for production footer build tag)

### Build

```bash
npm run build
```

### Production Runtime (Local)

```bash
npm run build
npm run start
```

Health endpoint:

```bash
curl http://localhost:3000/healthz
```

#### Build Commit Hash
The build number shown in the UI comes from commit values in this order:

- Runtime config `/env.js` key `GIT_COMMIT` (for example Railway `RAILWAY_GIT_COMMIT_SHA` wired by `server.js`).
- Build-time `VITE_GIT_COMMIT` fallback.
- `window.__APP_COMMIT__` fallback.

To ensure a meaningful version (instead of the default `dev`/fallback value), set a real commit SHA at runtime (`GIT_COMMIT`) in deployment.

### Testing

```bash
npm test
```

```bash
npm run test:ci
```

```bash
npm run test:api
```

## Railway Deployment Setup

The repo is configured for Railway Docker deployments:

- `Dockerfile`: builds Vite assets and runs the Node runtime server.
- `server.js`: serves `dist/`, dynamic `/env.js`, and `/healthz`.
- `.dockerignore`: trims deployment context for faster builds.
- Vercel support/config has been removed from this repository.

Railway service expectations:
- Internal app port: `3000` (Railway injects `PORT` at runtime).
- Start command comes from Docker `CMD` (`node server.js`).
- Configure environment variables per Railway environment (`beta`, `prod`) using the runtime keys above.

## Features
- **Dashboard**: Overview of agent activity.
- **Contacts**: Manage user contacts.
- **Phone/SMS**: Interactive demos for phone and text agents.
- **Data Sources**: Manage knowledge base files.

## Backend Compatibility Layer (Current)

The console currently runs in a compatibility mode to bridge project-scoped UX with partially tenant-scoped backend APIs.

### Product and Scope Constraints
- **One project per Organization (tenant) in UX**: The UI currently treats each Organization as having one active Project, while keeping multi-Project routing and service scaffolding intact.
- **Organization = tenant mapping**: Organization screens are backed by tenant endpoints (`/user/tenants`, `/admin/tenants`).

### Facades and Mappings
- **Project facade (`src/services/projectFacade.ts`)**:
  - Persists `projectId -> tenantId` in local storage.
  - Resolves tenant context from `{ organizationId, projectId }` scope objects.
  - Persists `projectId -> personalityTemplateId` for personality canonical selection.
- **Agent facade (`src/services/agentFacade.ts`)**:
  - Bridges project-scoped Personality UI to tenant-scoped chat template endpoints.
  - Enforces single-template behavior in frontend (canonical template selection + duplicate cleanup).
  - Resolves Agent Contact details from tenant/project data:
    - `firstName` from Project name.
    - phone number from Organization `twilioNumber`.

### Contacts and Knowledge (Tenant-backed today)
- **Contacts**:
  - `getContacts/getContact` currently use tenant user endpoints (`/tenants/users`).
  - Contacts are tenant-backed today, not truly project-scoped contact records yet.
- **Knowledge/Data Sources**:
  - Knowledge services accept either tenant ID or `{ organizationId, projectId }` scope.
  - Requests resolve to tenant-scoped datasource APIs via `x-tenant-id`.

### Auth, Invitation, and Admin Compatibility
- **Invitation acceptance**:
  - Single `/accept-invitation` auth flow (sign in/register/confirm) with inline errors.
  - Accept-invitation retries token aliases only when backend validation explicitly requires alias fields.
- **Cognito to backend sync**:
  - Frontend calls `POST /user/sync` after sign-in/session restore to ensure backend user records exist before tenant-scoped reads.
- **Admin fallback**:
  - If admin project endpoint access fails (`401/403`), admin mode is disabled and project loading falls back to tenant-header endpoints.

### Personality Access Rules
- **Template mode gating**:
  - `FULL_CONTROLLED` mode is super-admin only.
  - Non-super-admin users can only save `PARAMETERIZED` mode (enforced in UI and service layer).

### Migration Targets (When Backend Catches Up)
- Move Contacts to true project-scoped contact resources.
- Replace frontend singleton cleanup with backend-enforced singleton guarantees for personality templates.
- Remove one-project UX constraint once multi-project behavior is fully supported in backend contracts.
