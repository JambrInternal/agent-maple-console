# Agent Maple Console — Agent Rules

**Read this first.** This file tells AI agents how to work in this codebase.

## Commands

- **Dev server:** `npm run dev` (Vite)
- **Build:** `npm run build` (Vite → `dist/`)
- **Lint:** `npm run lint` (ESLint 9 flat config)
- **Test all:** `npm run test:ci` (Vitest, non-interactive)
- **Test watch:** `npm test` (Vitest, watch mode)
- **Test single file:** `npx vitest run src/path/to/__tests__/file.test.ts`
- **API smoke tests:** `npm run test:api` (full) / `npm run test:api:min` (minimal)
- **Generate API types:** `npm run generate:api` (fetches OpenAPI spec → `src/api/generated/`)
- **Check API freshness:** `npm run check:api` (fails if spec is outdated)
- **Production server:** `npm start` (Node HTTP server on port 3000)

CI runs: **lint → test:ci → test:api → build** (on both PRs and main pushes).

## Architecture

React 19 SPA — management console for configuration and reporting (not real-time chat).

```
src/
├── api/            # API client, generated OpenAPI types/operations (see src/api/AGENTS.md)
├── app/            # AppProviders.jsx, AppRoutes.jsx (routing + context wiring)
├── components/     # Shared UI: Layout, Sidebar, AuthGuard, ErrorBoundary, etc.
├── config/         # Runtime config (runtimeConfig.ts — reads window.__APP_CONFIG__)
├── contexts/       # React context providers (AuthContext.tsx)
├── featureFlags/   # PostHog-based feature flag system (flagCatalog, FeatureGateRoute)
├── features/       # Feature modules: auth, contacts, invitation, knowledge, organization,
│                   #   personality, projects, team — each with components/, __tests__/, utils
├── hooks/          # Custom hooks (useApiQuery)
├── pages/          # Route-level page components (one per route)
├── services/       # Business logic services (auth, threads, issues, knowledge, etc.)
├── test/           # Test setup (Vitest + Testing Library + jsdom)
└── utils/          # Shared utilities
scripts/            # Build tools: OpenAPI generation, API smoke tests
server.js           # Production Node HTTP server (serves SPA, injects runtime config at /env.js)
```

**Key tech:**
- React 19 + React Router 7 + TanStack Query 5
- Vite 7 (build) + Vitest 2 (test) + jsdom (test env)
- TypeScript for services/API layer, JSX for pages/components (mixed .ts/.tsx/.jsx codebase)
- AWS Cognito auth via Amplify SDK, tokens in localStorage (`am_` prefix)
- PostHog for feature flags and analytics
- openapi-typescript for generated API types
- Deployed via Docker (multi-stage build) to Railway

**Runtime config pattern:** Build-time env vars (`VITE_*`) are fallbacks. Production uses `server.js` which injects `window.__APP_CONFIG__` at `/env.js` from environment variables. `runtimeConfig.ts` reads from `window.__APP_CONFIG__` first, falls back to `import.meta.env`.

## Conventions

### File naming
- Pages: `PascalCase.jsx` (e.g., `Knowledge.jsx`)
- Services: `camelCase.ts` (e.g., `projectFacade.ts`)
- Feature modules: `src/features/<name>/` with `components/`, `__tests__/`, and utility files
- Tests: colocated in `__tests__/` directories, named `<subject>.test.{ts,tsx,jsx}`
- Generated code: `src/api/generated/` — never edit manually

### Code style (enforced by ESLint)
- `eqeqeq: always` — no `==`
- `prefer-const` — use `const` over `let` when possible
- `no-var` — never use `var`
- `no-console` — use `verboseLogger` instead (scripts are exempt)
- `object-shorthand: always`
- `prefer-template` — use template literals over concatenation
- Unused vars: prefix with `_` (e.g., `_error`)

### Commit messages
- Format: `type(scope): description` — often with emoji prefix
- Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`
- Examples: `✨ feat(voice): display real phone number when configured`
- Examples: `🐛 fix(ui): show skeleton instead of UUID fallback`

### Testing
- Framework: Vitest + @testing-library/react + jsdom
- Setup: `src/test/setup.ts` (auto-cleanup, jest-dom matchers)
- Pattern: unit test services/utils in TS, component tests in JSX/TSX
- Add or update tests when behavior changes

## Before Any Work

1. **Read docs**: Start with `agent_docs/product/PRD.md` for requirements
2. **Check terminology**: Use `agent_docs/product/CORE_CONCEPTS.md` for domain terms
3. **Review constraints**: See `agent_docs/contributing/AGENT_RULES.md`
4. **Review testing**: See `agent_docs/contributing/TESTING.md`
5. **Tooling**: Use `mise` and `.tool-versions` to align Node versioning (20.19.0)
6. **Backend Sync**: If `src/api/` was not updated in the past 24h, run `npm run generate:api` to regenerate the OpenAPI types, then update API tests.
7. **Review and Update** `agent_docs/task.md`: One task at a time. Nested tasks/projects/initiatives encouraged. Outline the task, create a broken-down todo list. Take inventory of unfinished tasks. Remove completed tasks older than 1 month. Mark tasks requiring human intervention as complete.

## During Work

- Use correct terminology (Thread, Issue, Contact, Project, Organization)
- Follow the Industrial Navy design system (`agent_docs/product/BRAND.md`)
- Reference API contracts in `agent_docs/architecture/BACKEND.md`
- Add or update tests using Vitest (`agent_docs/contributing/TESTING.md`) when behavior changes
- When useful, add future work to `agent_docs/task.md`

## After Work (REQUIRED)

**Every agent action must include a docs review.** Ask yourself:

1. Did I learn something that should be documented?
2. Did I make a change that affects the PRD or architecture?
3. Are there outdated docs that contradict what I just did?
4. Always be refactoring content in agent_docs when there is an opportunity.
5. Update `agent_docs/task.md` — append YYYY-MM-DD to newly completed tasks, take inventory of unfinished tasks, infer broader projects/initiatives, remove completed tasks older than 1 month, mark human-intervention tasks as complete.
6. If any docs were updated, explain why.

If yes to any, **update the relevant doc**.

## Constraints

- **Never edit files in `src/api/generated/`** — they are auto-generated. Run `npm run generate:api` instead.
- **No `console.log`** — use `verboseLogger` from `src/utils/verboseLogger.js`. Scripts in `scripts/` are exempt.
- **No `==`** — always use `===`.
- **CI must pass before merge** — lint, test:ci, test:api, build.
- **agent_docs/ is gitignored** — these are local-only docs, never committed.
- **Node 20.19.0** — do not change the Node version without updating `.tool-versions`, `mise.toml`, `Dockerfile`, and CI workflows in lockstep.
- **Don't import React** for JSX — the project uses the automatic JSX transform (`react/react-in-jsx-scope: off`).

## Docs Structure

```
agent_docs/
├── product/           # WHAT we're building
│   ├── PRD.md         # Requirements (source of truth)
│   ├── CORE_CONCEPTS.md
│   └── BRAND.md
├── architecture/      # HOW it's built
│   ├── BACKEND.md
│   └── HIERARCHY.md
└── contributing/      # HOW to contribute
    ├── AGENT_RULES.md
    ├── COPY_RULES.md
    └── TESTING.md
├── task.md            # Current task tracking
└── *.md               # Design/process docs (mockups, wireframes, audits, etc.)
```

## Key Terms (use consistently)

| Use This | Not This |
|----------|----------|
| Thread | conversation, chat |
| Issue | ticket, case |
| Contact | user (for external people) |
| Project | workspace, site |
| Organization | tenant, company |

## Quick Reference

- **Console purpose**: Configuration and reporting (not real-time chat)
- **Thread**: Contact + Issue mapping with conversation history
- **Issue**: Root cause linking multiple threads
- **Hierarchy**: User → Organization → Project → Threads/Issues

## Living Documentation

Docs should always reflect the current state of the system. If you find a discrepancy:
1. Fix the code if the doc is the intended behavior
2. Fix the doc if the code is the intended behavior
3. Ask the user if unclear

## Managing AGENTS.md Files

To regenerate or update all AGENTS.md files, run `/init-deep`.

### How it works

There is no automatic inheritance. AGENTS.md files are plain text — agents read whichever ones they find. Behavior varies by tool (some read only the nearest, some walk up to root, some read only root).

To compensate: every significant directory has its own AGENTS.md with directory-specific context, and a pointer line at the bottom: `See /AGENTS.md for project-wide rules.`

### Structure

- **Root `/AGENTS.md`** — project-wide rules: commands, architecture, conventions, constraints, workflow
- **Subdirectory AGENTS.md** — directory-specific context (purpose, key files, local conventions) + pointer to root

### Rules for maintaining

- **Every significant directory gets a file.** Significant = a directory where an agent creates or edits files. Skip `__tests__/`, `generated/`, `assets/`.
- **Keep them operational** — rules agents can follow, not documentation for humans.
- **Preserve existing rules when updating** — read first, then add.
- **When adding a new directory**, create its AGENTS.md immediately with purpose, key files, and the root pointer.
- **When adding a new convention or constraint**, add it to root. Only add to subdirectory files if the rule is scoped to that directory.
- **End every subdirectory file** with: `See /AGENTS.md for project-wide rules.` (or a more specific parent if relevant, e.g., `See src/api/AGENTS.md for API-layer rules.`)
