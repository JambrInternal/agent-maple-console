# src/test/ — Agent Rules

Test infrastructure.

- `setup.ts` — global test setup: `@testing-library/jest-dom/vitest` matchers + auto-cleanup
- Referenced by `vite.config.js` as `setupFiles`
- Framework: Vitest + @testing-library/react + jsdom

See `/AGENTS.md` for project-wide rules.
