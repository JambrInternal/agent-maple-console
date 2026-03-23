# src/features/auth/ — Agent Rules

Authentication feature module.

- Login/logout flows, session management, stale session detection
- `loginUtils.ts`, `postLoginRoute.ts` — login page helpers
- `useAuthDebug.ts`, `useLoginTheme.ts`, `useStaleSessionGuard.ts` — auth-specific hooks
- Auth components in `components/<Component>/<Component>.tsx` (e.g., `components/AuthDebugToggle/AuthDebugToggle.tsx`)

See `/AGENTS.md` for project-wide rules.
