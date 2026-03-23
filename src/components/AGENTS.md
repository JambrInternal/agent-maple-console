# src/components/ — Agent Rules

Shared UI components used across multiple pages.

- Directory convention: `src/components/<Component>/<Component>.tsx`
- Component tests are colocated in the same directory: `src/components/<Component>/<Component>.test.tsx`
- `Layout/Layout.tsx` — main app shell (sidebar + content area)
- `Sidebar/Sidebar.tsx` — navigation sidebar
- `AuthGuard/AuthGuard.tsx` — protects routes requiring authentication
- `ErrorBoundary/ErrorBoundary.tsx` — catches and displays React errors
- `QueryError/QueryError.tsx` — standardized API error display
- Components here must be generic — feature-specific components go in `features/<name>/components/`

See `/AGENTS.md` for project-wide rules.
