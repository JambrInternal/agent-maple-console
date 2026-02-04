---
description: Review and update documentation after any significant work
---

# Documentation Review Workflow

Run this workflow after completing any feature, bug fix, or refactor.

## Steps

1. **Check if docs are affected**
   Ask: Did this work change requirements, architecture, or terminology?

2. **Review relevant docs**
   - Feature work → check `docs/product/PRD.md`
   - API changes → check `docs/architecture/BACKEND.md`
   - Data model changes → check `docs/product/CORE_CONCEPTS.md`
   - UI changes → check `docs/product/BRAND.md`

3. **Update if needed**
   If the doc contradicts the new code, update the doc to match.
   Keep updates minimal and precise.

4. **Verify terminology**
   Ensure you used correct terms from `docs/product/CORE_CONCEPTS.md`:
   - Thread (not conversation)
   - Issue (not ticket)
   - Contact (not user for external people)
   - Project (not workspace)
   - Organization (not tenant)

5. **Commit docs with code**
   Include doc updates in the same PR/commit as the code change.

## When to Skip

- Pure refactors with no behavior change
- Typo fixes
- Dependency updates

## Doc Locations

| Topic | File |
|-------|------|
| Requirements | `docs/product/PRD.md` |
| Terminology | `docs/product/CORE_CONCEPTS.md` |
| Design | `docs/product/BRAND.md` |
| API | `docs/architecture/BACKEND.md` |
| Hierarchy | `docs/architecture/HIERARCHY.md` |
