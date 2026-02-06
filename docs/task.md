# Professional Design Process: Agent Maple Console

## Current Task: Wire Console To `api.yaml`

**Goal**: Use the live API surface from `docs/architecture/api.yaml` and remove all mock features.

**Todo**
- [x] Review `docs/architecture/api.yaml` endpoints and schemas used by the console.
- [x] Audit `src/services/*` and `src/api/types.ts` for data expectations and gaps.
- [x] Align UI models to current API gaps (IssueStatus `in_progress`, drop Thread channels/messages, remove Contact escalation fields).
- [x] Add a response-mapping layer (snake_case -> camelCase) with shared helpers.
- [x] Implement Organizations + Projects API calls (`/organizations`, `/organizations/{id}`, `/organizations/{id}/projects`, `/projects/{id}`).
- [x] Add `POST /organizations` support in API docs + UI create flow.
- [x] Implement Threads + Issues API calls with filters and status mapping.
- [x] Implement Contacts/Console Users mapping via `/tenants/users` endpoints and document missing fields.
- [x] Implement Knowledge Base calls via `/datasources` endpoints with mapped fields.
- [x] Decide approach for missing surfaces (thread messages, insights, tools & skills) and document backend needs.
- [x] Update/extend service and page tests to cover API wiring.
- [x] Remove mock mode, fixtures, and mock UI surfaces.
- [x] Consolidate Contacts + Console Users into `src/services/people.ts`.
- [ ] Manual verification against the live API.
- [ ] Human review requested

## Phase 1: Context & Discovery [x]
- [x] Requirement Gathering: Define the "Why"
- [x] User Personas & Stories: Define the "Who"
- [x] Audit & Inspiration: Benchmarking

## Phase 2: Information Architecture [x]
- [x] Sitemap & Navigation
- [x] Total Redesign of Wireframes (Supabase-Style)
- [x] User Flow Validation

## Phase 3: High-Fidelity Design [x]
- [x] Design System Foundation (Tokens)
- [x] Component Library Development
- [x] HTML/CSS Base Shell & Icons
- [x] Formal Product Logic Documentation (Core Concepts)
- [x] Organization-Level Mockups (No Project Selected)
  - [x] Projects Page (Grid & Management)
  - [x] Team Page (Role & MFA Management)
  - [x] Usage Page (Concurrency & Token Rollups)
  - [x] Billing Page (Plan & Subscription)
  - [x] Org Settings Page (Global Identity & Auth)

- [ ] Phase 4: Implementation [/]
  - [x] Mock API/Service Layer (TypeScript + Fixtures)
  - [x] Foundations: Theme & Global Shell
  - [x] Page 1: Organization Selection [x]
  - [x] Authentication & Certly Login Flow [x]
    - [x] Identify Cognito Credentials
    - [x] `aws-amplify` Installation
    - [x] Amplify Configuration
    - [x] `AuthContext` & Certly integration
    - [x] Login Screen implementation
    - [x] Route guarding
  - [x] Page 2: Projects Grid (Org Home) [x]
  - [ ] Page 3: Threads Monitoring (Project Level) [ ]
  - [ ] Page 4: Issues Monitoring [ ]
  - [ ] Page 5: Tools & Skills (Configuration) [ ]
  - [ ] Page 6: Knowledge Base [ ]
  - [ ] Page 7: Contacts Directory [ ]
  - [ ] Page 8: Insights & Analytics [ ]
  - [ ] Page 9: Org Settings (Team, Billing, Usage) [ ]

## Phase 5: Feedback & Iteration [ ]
- [ ] Usability Testing [ ]
- [ ] Polish & Refinement [ ]
