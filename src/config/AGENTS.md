# src/config/ — Agent Rules

Runtime configuration.

- `runtimeConfig.ts` reads from `window.__APP_CONFIG__` (injected by `server.js` at `/env.js`), falls back to `import.meta.env.VITE_*`
- Never hardcode environment-specific values — use `getAppConfig()`
- Config keys: API_URL, AWS_REGION, COGNITO_USER_POOL_ID, COGNITO_APP_CLIENT_ID, POSTHOG_KEY, POSTHOG_HOST, APP_ENV, GIT_COMMIT

See `/AGENTS.md` for project-wide rules.
