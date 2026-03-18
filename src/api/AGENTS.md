# src/api/ — Agent Rules

## Generated Code

`generated/` contains auto-generated files from the OpenAPI spec. **Never edit these manually.**

- `generated/openapi.json` — raw OpenAPI spec from the backend
- `generated/openapi.ts` — TypeScript types (via openapi-typescript)
- `generated/operations.ts` — typed API operation functions

To regenerate: `npm run generate:api`
To check freshness: `npm run check:api`

## Hand-Written Files

- `client.ts` — `apiFetch<T>()` wrapper (auth headers, tenant header, 401 handling)
- `auth.ts` — Cognito auth API helpers
- `mappers.ts` + `mapping/` — transform API responses to UI models
- `types.ts` — shared non-generated types
- `index.ts` — barrel export (re-exports client, auth, types, and generated operations)

## Rules

- All API calls go through `apiFetch()` from `client.ts` — never use raw `fetch()`
- Auth token from `localStorage.getItem('am_auth_token')` with fresh-token fallback via `services/token.ts`
- Tenant ID attached via `x-tenant-id` header (except exempt paths: `/user/sync`, `/user/tenants`, `/user/accept-invitation`)
- When the backend API changes, run `npm run generate:api` and update tests in `__tests__/`

See `/AGENTS.md` for project-wide rules.
