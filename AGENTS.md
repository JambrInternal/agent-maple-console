# Agent Maple Console - Agent Guide

**Read this first.** This file tells AI agents how to work in this codebase.

## Before Any Work

1. **Read docs**: Start with `agent_docs/product/PRD.md` for requirements
2. **Check terminology**: Use `agent_docs/product/CORE_CONCEPTS.md` for domain terms
3. **Review constraints**: See `agent_docs/contributing/AGENT_RULES.md`
4. **Review testing**: See `agent_docs/contributing/TESTING.md`
5. **Tooling**: Use `mise` and `.tool-versions` to align Node versioning
6. **Review and Update** `agent_docs/task.md`: One task at a time. Outline the task as you see it, create a goal with a broken down todo list.

## During Work

- Use correct terminology (Thread, Issue, Contact, Project, Organization)
- Follow the Industrial Navy design system (`agent_docs/product/BRAND.md`)
- Reference API contracts in `agent_docs/architecture/BACKEND.md`
- Add or update tests using Vitest (`agent_docs/contributing/TESTING.md`) when behavior changes

## After Work (REQUIRED)

**Every agent action must include a docs review.** Ask yourself:

1. Did I learn something that should be documented?
2. Did I make a change that affects the PRD or architecture?
3. Are there outdated docs that contradict what I just did?
4. Always be refactoring content in agent_docs when there is an opportunity.
5. Update `agent_docs/task.md`. Every time a task is completed, ask for a human review on the task.
6. If any docs were updated, ask for a human review on the docs changes.

If yes to any, **update the relevant doc**.

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
