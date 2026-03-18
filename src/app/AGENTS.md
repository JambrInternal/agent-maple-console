# src/app/ — Agent Rules

App-level wiring.

- `AppProviders.jsx` — context providers (auth, query client, PostHog, router)
- `AppRoutes.jsx` — all route definitions with auth guards and feature gates
- Changes here affect the entire app — test thoroughly

See `/AGENTS.md` for project-wide rules.
