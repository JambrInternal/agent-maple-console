# src/features/ — Agent Rules

Feature modules. Each feature follows the same structure:

```
features/<name>/
├── components/        # Feature-specific React components
├── __tests__/         # Tests for utils and hooks
└── <name>Utils.ts     # Feature-specific utility functions
```

- Keep feature logic self-contained — cross-feature imports should go through `services/`
- Utility files: `<feature>Utils.ts` (e.g., `knowledgeUtils.ts`)
- Component tests go in `components/__tests__/`, util tests in `__tests__/`

Current features: auth, contacts, invitation, knowledge, organization, personality, projects, team

See `/AGENTS.md` for project-wide rules.
