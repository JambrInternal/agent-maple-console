# src/features/ — Agent Rules

Feature modules. Each feature follows the same structure:

```
features/<name>/
├── components/
│   └── <Component>/
│       ├── <Component>.tsx
│       └── <Component>.test.tsx (optional)
├── <feature>Utils.ts
├── <feature>Utils.test.ts
├── use<Feature>.ts
└── use<Feature>.test.ts
```

- Keep feature logic self-contained — cross-feature imports should go through `services/`
- Utility files: `<feature>Utils.ts` (e.g., `knowledgeUtils.ts`)
- Tests are colocated with source files (component tests in component folders, util/hook tests at feature root)

Current features: auth, contacts, invitation, knowledge, organization, personality, projects, team

See `/AGENTS.md` for project-wide rules.
