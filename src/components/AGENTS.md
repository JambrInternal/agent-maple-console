# src/components/ — Agent Rules

Shared UI components used across multiple pages.

- `Layout.jsx` — main app shell (sidebar + content area)
- `Sidebar.jsx` — navigation sidebar
- `AuthGuard.tsx` — protects routes requiring authentication
- `ErrorBoundary.tsx` — catches and displays React errors
- `QueryError.tsx` — standardized API error display
- Components here must be generic — feature-specific components go in `features/<name>/components/`

See `/AGENTS.md` for project-wide rules.
