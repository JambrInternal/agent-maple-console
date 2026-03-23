# src/featureFlags/ — Agent Rules

PostHog-based feature flag system.

- `flagCatalog.ts` — defines all known flags and their defaults
- `featureFlagService.ts` — evaluates flags (PostHog → catalog fallback)
- `useFeatureFlag.ts` — React hook for flag checks
- `FeatureGateRoute.tsx` — route-level gate component (wraps routes behind flags)
- `posthogProvider.tsx` — PostHog SDK initialization
- Add new flags to `flagCatalog.ts` first, then use via `useFeatureFlag()`

See `/AGENTS.md` for project-wide rules.
