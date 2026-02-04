# Testing

## Stack
- **Runner**: Vitest
- **Rendering**: React Testing Library
- **DOM**: JSDOM
- **Matchers**: `@testing-library/jest-dom`

## Commands
- `npm test` — watch mode
- `npm run test:ci` — single run (CI)

## Conventions
- Place tests next to the unit under `__tests__`.
- Use `.test.jsx` for React components.
- Prefer user-focused assertions (text, labels, roles).

## Setup
- Global test setup lives in `src/test/setup.ts`.
- Vitest config is in `vite.config.js` under `test`.
