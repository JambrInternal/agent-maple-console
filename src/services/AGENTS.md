# src/services/ — Agent Rules

Business logic and API orchestration layer. All files are TypeScript (`.ts`).

- Services call `apiFetch()` from `src/api/client.ts` — never raw `fetch()`
- Facade pattern: `projectFacade.ts`, `agentFacade.ts` aggregate multiple API calls
- `auth.ts` / `authEvents.ts` — Cognito auth flows
- `token.ts` — JWT token management (refresh, storage)
- Barrel export via `index.ts`

See `/AGENTS.md` for project-wide rules.
