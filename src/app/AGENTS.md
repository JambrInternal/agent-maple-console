# src/app/ — Agent Rules

App-level wiring.

- `AppProviders.tsx` — context providers (auth, query client, PostHog, router)
- `AppRoutes.tsx` — all route definitions with auth guards and feature gates
- Changes here affect the entire app — test thoroughly

See `/AGENTS.md` for project-wide rules.
