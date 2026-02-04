# Agent Maple Console - Documentation

## For AI Agents
**Start with `/AGENTS.md` in the project root** - it tells you how to work here.

## Structure

```
docs/
├── robots.txt           # Agent navigation guide
├── README.md            # This file
├── product/
│   ├── PRD.md           # Product requirements (source of truth)
│   ├── CORE_CONCEPTS.md # Platform terminology
│   └── BRAND.md         # Voice, tone, visual direction
├── architecture/
│   ├── BACKEND.md       # API services and endpoints
│   └── HIERARCHY.md     # Org > Project > Thread model
└── contributing/
    ├── AGENT_RULES.md   # Constraints for AI agents
    ├── COPY_RULES.md    # Writing style guidelines
    └── TESTING.md       # Test stack and commands
```

## Key Documents

| Document | Purpose |
|----------|---------|
| [PRD.md](./product/PRD.md) | Full requirements, data models, scope |
| [CORE_CONCEPTS.md](./product/CORE_CONCEPTS.md) | Thread, Issue, Contact definitions |
| [BRAND.md](./product/BRAND.md) | Industrial Navy theme, typography |
| [BACKEND.md](./architecture/BACKEND.md) | API endpoints, auth flow |
| [TESTING.md](./contributing/TESTING.md) | How to run and write tests |

## Terminology
- **Thread**: Contact + Issue mapping with conversation history
- **Issue**: Root cause linking multiple threads
- **Project**: Job site with dedicated AI agent
- **Organization**: Billing entity, user management
