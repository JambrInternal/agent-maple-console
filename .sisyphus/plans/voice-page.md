# Voice Page: Data-Driven Phone Number Display

## TL;DR

> **Quick Summary**: Replace the static "Phone Session Not Configured" placeholder on the Voice page with a data-driven page that fetches the project's phone number via `getProjectAgentContact()` and conditionally renders the configured state (phone number + copy button + instructions) or the unconfigured placeholder.
> 
> **Deliverables**:
> - Updated `Voice.jsx` with data fetching, loading/error/configured/unconfigured states
> - Rewritten `Voice.test.jsx` covering all four render states
> 
> **Estimated Effort**: Quick
> **Parallel Execution**: NO — 2 sequential tasks (implementation then tests)
> **Critical Path**: Task 1 (Voice.jsx) → Task 2 (Voice.test.jsx)

---

## Context

### Original Request
The Voice page at `/:orgId/:projId/voice` shows a hardcoded "Phone Session Not Configured" placeholder even when the phone feature is actively working on the backend. The user wants the page to display the real Twilio phone number when configured, and only show the placeholder when genuinely unconfigured.

### Interview Summary
**Key Discussions**:
- **No browser calling**: User explicitly said "don't need to call from the web app" — no WebSocket, WebRTC, Twilio client SDK
- **No chat feature**: User explicitly said "i don't want the start chat feature"
- **Display-only page**: Show phone number + status when configured, current placeholder when not

**Research Findings**:
- `getProjectAgentContact()` in `agentFacade.ts:216-235` already resolves the phone number from `organization.twilioNumber` and returns `{ firstName, phoneNumber, source: 'tenant_twilio' | 'unconfigured' }`
- Sidebar already calls this with query key `['projectAgentContact', orgId, projId]` — Voice page should reuse for cache sharing
- CSS classes `.am-phone-callout`, `.am-phone-number`, `.am-phone-number-sub`, `.am-voice-callout`, `.am-callout-list` already exist at `src/index.css:625-669`
- Personality.jsx demonstrates the exact three-state pattern (loading / error / data) used across the app

### Metis Review
**Identified Gaps** (addressed):
- Clipboard API needs try/catch with fallback — addressed with inline `navigator.clipboard.writeText()` + useState for "Copied!" feedback
- Test provider setup — addressed by following Personality.test.jsx pattern exactly
- Phone number formatting — addressed by displaying raw (matches Sidebar behavior)

---

## Work Objectives

### Core Objective
Make the Voice page data-driven: fetch the project's agent contact, show the real phone number when configured, show the existing placeholder when not.

### Concrete Deliverables
- `src/pages/Voice.jsx` — Updated with data fetching and conditional rendering
- `src/pages/__tests__/Voice.test.jsx` — Rewritten with four test cases

### Definition of Done
- [ ] `npm run test:ci` passes with zero regressions
- [ ] Voice page shows phone number when `source === 'tenant_twilio'`
- [ ] Voice page shows "Not Configured" placeholder when `source === 'unconfigured'`
- [ ] Voice page shows loading state while fetching
- [ ] Voice page shows QueryError on fetch failure

### Must Have
- Data fetching via `useApiQuery` with `getProjectAgentContact()`
- Query key `['projectAgentContact', orgId, projId]` (matches Sidebar for cache sharing)
- Conditional rendering: configured / unconfigured / loading / error
- Copy-to-clipboard button for phone number using inline `navigator.clipboard.writeText()`
- "Copied!" feedback via `useState` (resets after ~2s timeout)
- Use existing CSS classes only (`.am-phone-callout`, `.am-phone-number`, etc.)

### Must NOT Have (Guardrails)
- No WebSocket, WebRTC, or Twilio client SDK integration
- No "Start Chat" or "Start Call" feature
- No new CSS classes or styles — use only existing classes
- No new service files or API wrappers
- No import of `call_session` endpoint or `operations.ts`
- No phone number formatting/masking — display raw value
- No reusable clipboard component — inline only
- No personality template fetching on Voice page
- No `console.log` in production code

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (Vitest + React Testing Library)
- **Automated tests**: YES (Tests-after — Task 2)
- **Framework**: Vitest

### QA Policy
Every task includes agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright — Navigate, interact, assert DOM, screenshot
- **Tests**: Use Bash — Run `npm run test:ci`, verify pass/fail output

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Sequential — implementation before tests):
├── Task 1: Update Voice.jsx with data fetching + conditional rendering [quick]
└── Task 2: Rewrite Voice.test.jsx with four-state coverage (depends: 1) [quick]

Wave FINAL (After ALL tasks — verification):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA with Playwright (unspecified-high)
└── Task F4: Scope fidelity check (deep)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| 1    | —         | 2, F1-F4 |
| 2    | 1         | F1-F4 |
| F1-F4 | 1, 2    | — |

### Agent Dispatch Summary

- **Wave 1**: 2 tasks — T1 → `quick`, T2 → `quick`
- **FINAL**: 4 tasks — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. Update Voice.jsx — Data Fetching + Conditional Rendering

  **What to do**:
  - Add imports: `useParams` from `react-router-dom`, `useApiQuery` from `../hooks/useApiQuery`, `getProjectAgentContact` from `../services/agentFacade`, `QueryError` from `../components/QueryError`, `Copy` and `Check` from `lucide-react`
  - Extract `orgId` and `projId` from `useParams()`
  - Call `useApiQuery` with query key `['projectAgentContact', orgId, projId]` and fetcher `getProjectAgentContact({ organizationId: orgId, projectId: projId })` — follow exact same pattern as Sidebar.jsx lines 139-152
  - Add `useState` for clipboard feedback: `const [copied, setCopied] = useState(false)`
  - Add copy handler: `const handleCopy = async () => { try { await navigator.clipboard.writeText(projectAgentContact.phoneNumber); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {} }`
  - Implement four-state conditional rendering inside the existing `.am-voice-stack` section:
    1. **Loading**: `{isLoading && <div className="am-text-2" style={{ padding: '1rem 0' }}>Loading phone configuration...</div>}`
    2. **Error**: `{!isLoading && error && <QueryError message="Failed to load phone configuration." error={error} onRetry={refetch} />}`
    3. **Configured** (`source === 'tenant_twilio'`): Render a card with `.am-phone-callout` containing the phone number (`.am-phone-number`), a "Project phone number" subtitle (`.am-phone-number-sub`), and a copy button using the `Copy`/`Check` icon. Below, render a `.am-card.am-voice-callout` tips section with an `<h2>` and `.am-callout-list` with usage instructions (e.g., "Call this number to start a conversation with the agent", "Each call creates a new conversation thread", "Call history appears in the Threads page")
    4. **Unconfigured** (`source !== 'tenant_twilio'`): Keep the existing placeholder markup exactly as-is (the current Phone section with step list)
  - Keep the outer page structure (`.am-page-content`, `.am-voice-container`, `.am-page-header`) untouched
  - Keep the page title "Chat on Phone" and subtitle

  **Must NOT do**:
  - Do NOT create new CSS classes or inline styles (except the loading div pattern from Personality.jsx)
  - Do NOT import `call_session` or any generated API operations
  - Do NOT add a "Start Call" or "Start Chat" button
  - Do NOT format/mask the phone number — display raw
  - Do NOT create a separate clipboard utility/component
  - Do NOT add `console.log` statements

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single-file JSX update with well-defined pattern to follow, no architectural decisions
  - **Skills**: []
    - No special skills needed — standard React component update
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Not needed — using existing CSS classes, no design work
    - `playwright`: Not needed — implementation only, QA is in final wave

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (sequential — must complete before Task 2)
  - **Blocks**: Task 2, F1-F4
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL):

  **Pattern References** (existing code to follow):
  - `src/pages/Personality.jsx:17-38` — `useParams()` + `useApiQuery()` pattern: exact hook call structure, query key format, enabled condition, destructuring `{ data, isLoading, error, refetch }`
  - `src/pages/Personality.jsx:74-121` — Three-state conditional rendering pattern: `{isLoading && ...}`, `{!isLoading && error && <QueryError .../>}`, `{!isLoading && !error && ...}`
  - `src/components/Sidebar.jsx:139-152` — `getProjectAgentContact()` call: exact query key `['projectAgentContact', orgId, projId]`, fetcher lambda, `{ enabled: !!orgId && !!projId }` option — MUST match this for cache sharing
  - `src/pages/Voice.jsx:17-40` — Current placeholder markup: preserve this exactly as the "unconfigured" branch

  **API/Type References** (contracts to implement against):
  - `src/services/agentFacade.ts:216-235` — `getProjectAgentContact()` function signature: accepts `ProjectFacadeScope` `{ organizationId, projectId }`, returns `Promise<ProjectAgentContact>` with `{ firstName: string|null, phoneNumber: string|null, source: 'tenant_twilio' | 'unconfigured' }`

  **CSS References** (classes to use):
  - `src/index.css:625-634` — `.am-phone-callout`: flex container for phone number display (background, border, border-radius, padding, gap)
  - `src/index.css:636-641` — `.am-phone-number`: large bold phone number text
  - `src/index.css:643-647` — `.am-phone-number-sub`: small subtitle below phone number
  - `src/index.css:649-660` — `.am-voice-callout`: blue-tinted info card for tips/instructions
  - `src/index.css:662-669` — `.am-callout-list`: disc-style list inside voice callout

  **Component References**:
  - `src/components/QueryError.tsx:4-28` — Props: `{ message: string, error: unknown, onRetry?: () => void }` — renders error message with optional retry button

  **External References**:
  - `lucide-react` — Already used in current Voice.jsx (`Phone`), add `Copy` and `Check` icons for clipboard button

  **WHY Each Reference Matters**:
  - Personality.jsx pattern ensures consistency with how ALL pages in this app handle async data
  - Sidebar.jsx query key ensures the Voice page shares the same React Query cache entry (no double fetching)
  - The CSS classes are ready-made for this exact UI — using them avoids creating new styles
  - QueryError provides consistent error UX with retry across the entire app

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Configured project shows phone number
    Tool: Playwright (playwright skill)
    Preconditions: App running at localhost, logged in, navigated to a project with a configured Twilio number
    Steps:
      1. Navigate to `/{orgId}/{projId}/voice`
      2. Wait for loading to complete (wait for `.am-phone-callout` to appear, timeout: 10s)
      3. Assert `.am-phone-number` element exists and contains a phone number string (non-empty text)
      4. Assert `.am-voice-callout` tips card is visible with `h2` text
      5. Assert `.am-callout-list` contains at least 2 list items
      6. Assert no element with text "Phone Session Not Configured" is visible
      7. Screenshot the page
    Expected Result: Phone number displayed in callout, tips card visible, placeholder hidden
    Failure Indicators: `.am-phone-callout` not found, phone number text empty, placeholder text visible
    Evidence: .sisyphus/evidence/task-1-configured-phone.png

  Scenario: Unconfigured project shows placeholder
    Tool: Playwright (playwright skill)
    Preconditions: App running at localhost, logged in, navigated to a project WITHOUT a configured Twilio number
    Steps:
      1. Navigate to `/{orgId}/{projId}/voice`
      2. Wait for loading to complete (timeout: 10s)
      3. Assert text "Phone Session Not Configured" is visible
      4. Assert `.am-step-list` with 3 steps is visible
      5. Assert `.am-phone-callout` is NOT present in the DOM
      6. Screenshot the page
    Expected Result: Placeholder card with 3-step instructions displayed, no phone number
    Failure Indicators: `.am-phone-callout` visible, placeholder text missing
    Evidence: .sisyphus/evidence/task-1-unconfigured-placeholder.png

  Scenario: Copy button copies phone number
    Tool: Playwright (playwright skill)
    Preconditions: App running, Voice page loaded for configured project
    Steps:
      1. Navigate to `/{orgId}/{projId}/voice` for a configured project
      2. Wait for `.am-phone-callout` to appear
      3. Click the copy button (button inside `.am-phone-callout`)
      4. Assert "Copied!" text or Check icon appears (visual feedback)
      5. Wait 2.5 seconds
      6. Assert feedback resets (Copy icon returns)
      7. Screenshot after click showing feedback
    Expected Result: Click triggers clipboard write, visual feedback appears then resets
    Failure Indicators: No feedback after click, feedback doesn't reset
    Evidence: .sisyphus/evidence/task-1-copy-feedback.png
  ```

  **Commit**: YES
  - Message: `✨ feat(voice): display real phone number when configured`
  - Files: `src/pages/Voice.jsx`
  - Pre-commit: `npm run test:ci`

- [x] 2. Rewrite Voice.test.jsx — Four-State Test Coverage

  **What to do**:
  - Replace entire test file with new tests following `Personality.test.jsx` pattern
  - Mock `getProjectAgentContact` from `../../services/agentFacade` using `vi.mock` with `importOriginal` pattern
  - Create `renderPage()` helper with `QueryClient`, `QueryClientProvider`, `MemoryRouter` with `initialEntries={['/org_1/proj_1/voice']}`, `Routes` with `Route path="/:orgId/:projId/voice"`
  - Add `beforeEach` with `vi.clearAllMocks()`
  - Write 4 test cases:
    1. **Configured state**: Mock `getProjectAgentContact` to resolve `{ firstName: 'Test Project', phoneNumber: '+14165551234', source: 'tenant_twilio' }`. Assert phone number text `+14165551234` is visible. Assert "Phone Session Not Configured" is NOT visible. Assert copy button exists.
    2. **Unconfigured state**: Mock to resolve `{ firstName: null, phoneNumber: null, source: 'unconfigured' }`. Assert "Phone Session Not Configured" IS visible. Assert `.am-phone-callout` or phone number text is NOT visible.
    3. **Loading state**: Mock to return a never-resolving promise `new Promise(() => {})`. Assert loading text "Loading phone configuration..." is visible.
    4. **Error state**: Mock to reject with `new Error('Network error')`. Assert error message containing "Failed to load phone configuration" is visible. Assert retry button exists.
  - Each test should verify `getProjectAgentContact` was called with `{ organizationId: 'org_1', projectId: 'proj_1' }`

  **Must NOT do**:
  - Do NOT test clipboard functionality (browser API, would need complex mocking — leave for Playwright QA)
  - Do NOT import or test `call_session` endpoint
  - Do NOT add snapshot tests
  - Do NOT test routing/navigation

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single test file rewrite with clear pattern to follow from Personality.test.jsx
  - **Skills**: []
    - No special skills needed — standard Vitest + React Testing Library
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed — this is unit test writing, not browser testing

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (after Task 1)
  - **Blocks**: F1-F4
  - **Blocked By**: Task 1 (needs the updated Voice.jsx to exist)

  **References** (CRITICAL):

  **Pattern References** (existing code to follow):
  - `src/pages/__tests__/Personality.test.jsx:1-33` — Test file setup pattern: imports, `vi.mock('../../services/agentFacade', ...)` with `importOriginal`, `renderPage()` helper with `QueryClient + QueryClientProvider + MemoryRouter + Routes + Route`
  - `src/pages/__tests__/Personality.test.jsx:35-76` — Test case structure: `beforeEach` with `vi.clearAllMocks()`, `vi.mocked(fn).mockResolvedValue(...)`, `renderPage()`, assertions with `screen.findByRole` / `screen.findByText` / `screen.queryByText`
  - `src/pages/__tests__/Voice.test.jsx` — Current test file (will be completely replaced)

  **API/Type References** (mock shapes):
  - `src/services/agentFacade.ts:216-235` — `getProjectAgentContact()` return shape: `{ firstName: string|null, phoneNumber: string|null, source: 'tenant_twilio' | 'unconfigured' }`

  **Component References**:
  - `src/components/QueryError.tsx:14-16` — Error renders text content via `withStatus(message, error)` — tests should look for partial text match on "Failed to load phone configuration"

  **WHY Each Reference Matters**:
  - Personality.test.jsx is the canonical testing pattern — following it ensures consistency and correctness
  - The mock shape must exactly match `ProjectAgentContact` type to avoid false positives
  - Understanding QueryError's rendering helps write correct error-state assertions

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: All Voice tests pass
    Tool: Bash
    Preconditions: Task 1 (Voice.jsx update) is complete
    Steps:
      1. Run `npm run test:ci -- src/pages/__tests__/Voice.test.jsx`
      2. Assert exit code is 0
      3. Assert output shows 4 tests passed, 0 failures
    Expected Result: "4 passed" in output, exit code 0
    Failure Indicators: Any test failure, non-zero exit code
    Evidence: .sisyphus/evidence/task-2-voice-tests.txt

  Scenario: Full test suite still passes (no regressions)
    Tool: Bash
    Preconditions: Both tasks complete
    Steps:
      1. Run `npm run test:ci`
      2. Assert exit code is 0
      3. Assert no test files show failures
    Expected Result: All tests pass, zero regressions
    Failure Indicators: Any test failure in any file
    Evidence: .sisyphus/evidence/task-2-full-suite.txt
  ```

  **Commit**: YES (group with Task 1)
  - Message: `✨ feat(voice): display real phone number when configured`
  - Files: `src/pages/Voice.jsx`, `src/pages/__tests__/Voice.test.jsx`
  - Pre-commit: `npm run test:ci`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection → fix → re-run.

- [x] F1. **Plan Compliance Audit** — `oracle` ✅ APPROVED
   Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
   Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high` ✅ APPROVED
   Run linter + `npm run test:ci`. Review Voice.jsx and Voice.test.jsx for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
   Output: `Build [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`
   **Verification**: ESLint passed (exit 0), build succeeded (4.23s), catch block properly commented

- [x] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill) ✅ APPROVED
   Start from clean state. Navigate to Voice page for a configured project — verify phone number displays, copy button works, "Copied!" feedback appears and resets. Navigate for unconfigured project — verify placeholder shows. Test loading state. Save screenshots to `.sisyphus/evidence/final-qa/`.
   Output: `Scenarios [N/N pass] | VERDICT`
   **Verification**: 3/3 scenarios passed with Playwright, all evidence screenshots saved

- [x] F4. **Scope Fidelity Check** — `deep` ✅ APPROVED
   For each task: read "What to do", read actual diff (git diff). Verify 1:1 — everything in spec was built, nothing beyond spec was built. Check "Must NOT do" compliance. Flag unaccounted changes.
   Output: `Tasks [N/N compliant] | Unaccounted [CLEAN/N files] | VERDICT`
   **Verification**: All spec requirements met, 2 minor non-blocking deviations noted

---

## Commit Strategy

- **1**: `✨ feat(voice): display real phone number when configured` — `src/pages/Voice.jsx`, `src/pages/__tests__/Voice.test.jsx`, `npm run test:ci`

---

## Success Criteria

### Verification Commands
```bash
npm run test:ci  # Expected: all tests pass, including new Voice tests
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass
- [ ] Voice page shows phone number for configured projects
- [ ] Voice page shows placeholder for unconfigured projects
