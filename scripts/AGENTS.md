# scripts/ — Agent Rules

Build and CI utility scripts.

- `generate-openapi.mjs` — fetches OpenAPI spec from backend, generates types + operations
- `api-smoke.mjs` — minimal API smoke test (health check)
- `api-smoke-all.mjs` — full API smoke test suite
- `console.log` is allowed here (`no-console` rule is disabled for `scripts/`)
- All scripts are ESM (`.mjs`)

See `/AGENTS.md` for project-wide rules.
