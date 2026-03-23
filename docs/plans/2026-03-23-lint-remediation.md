# Lint Remediation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Resolve every outstanding ESLint error so `npm run lint` succeeds without warnings while preserving runtime behavior.

**Architecture:** Touch API helpers, runtime config tests, feature flag provider, entrypoint, and various feature components. Favor precise TypeScript types (unknown/error objects, structured mocks) and improve modal overlays to meet `jsx-a11y` rules using semantic elements plus keyboard handlers.

**Tech Stack:** React 19, TypeScript, Vitest, ESLint flat config, PostHog SDK, AWS Amplify Auth, Vite.

---

### Task 1: Harden auth/token/util types

**Files:**
- Modify: `src/api/auth.ts:48-220`, `src/api/types.ts:120-170`, `src/utils/errors.ts:1-80`, `src/services/token.ts:1-140`

**Step 1: Remove unused `syncUser` helper in `src/api/auth.ts` and keep login catch typed `catch (error: unknown)` with safe message extraction.**

```ts
let signInResult;
try {
  signInResult = await signIn({ username: email, password });
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('already signed in user')) { /* retry */ }
  throw error;
}
```

**Step 2: Replace `ToolSkill.configuration: Record<string, any>` with a `JsonValue` union in `src/api/types.ts` and export the helper type for reuse.**

```ts
type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
```

**Step 3: Update `getErrorDetail` in `src/utils/errors.ts` to narrow unknown inputs via an `ErrorLike` interface instead of `(error as any)`.**

**Step 4: Remove `(session as any)` in `src/services/token.ts` by using Amplify’s `fetchAuthSession` return type and narrowing `tokens?.idToken`. Guard payloads with `typeof === 'number'` checks.**

**Step 5: Verify touched files with targeted lint run.**

Run: `npx eslint src/api/auth.ts src/api/types.ts src/utils/errors.ts src/services/token.ts`
Expected: PASS.

---

### Task 2: Type-safe token and API tests

**Files:**
- Modify: `src/services/token.test.ts:1-220`, `src/api/client.test.ts:30-130`, `src/config/runtimeConfig.test.ts:1-220`

**Step 1: Type the in-memory storage stub in `token.test.ts` (return `Storage & { _store: Record<string,string> }`) and replace `as any` on mocked sessions with explicit `FetchAuthSessionOutput`-shaped objects.**

**Step 2: Define `MockFetchResponse` and `createFetchMock` helpers in `client.test.ts` so `globalThis.fetch` assignments and headers access avoid `as any`.**

```ts
interface MockFetchResponse {
  ok: boolean;
  status: number;
  statusText: string;
  json: () => Promise<unknown>;
}
type FetchMock = ReturnType<typeof vi.fn<Parameters<typeof fetch>, Promise<MockFetchResponse>>>;
```

**Step 3: In `runtimeConfig.test.ts`, declare `type TestWindow = Window & { __APP_CONFIG__?: Record<string, unknown> | null }`, replace `(window as any)` casts with helper `getTestWindow()` plus `setRuntimeConfig`. Drop unused `vi` import.**

**Step 4: Re-run lint for the test files.**

Run: `npx eslint src/services/token.test.ts src/api/client.test.ts src/config/runtimeConfig.test.ts`
Expected: PASS.

---

### Task 3: Feature flag provider + tests cleanup

**Files:**
- Modify: `src/featureFlags/posthogProvider.tsx:1-160`, `src/featureFlags/posthogProvider.test.tsx:40-90`

**Step 1: Switch React default import to named `ReactNode` usage, import hooks individually, and rename unused catch variable to `_error`.**

**Step 2: Provide `children: ReactNode` type alias for props, ensuring no implicit `{}` types remain.**

**Step 3: In the test, replace `callback: Function` with the correct PostHog callback signature. Define `type FeatureFlagsCallback = (flags: string[], variants: Record<string, unknown>, opts: { errorsLoading: boolean }) => void`.**

**Step 4: Lint the feature flag files.**

Run: `npx eslint src/featureFlags/posthogProvider.tsx src/featureFlags/posthogProvider.test.tsx`
Expected: PASS.

---

### Task 4: Modal accessibility fixes

**Files:**
- Modify: `src/features/knowledge/components/KnowledgeCloudSyncDialog/KnowledgeCloudSyncDialog.tsx`
- Modify: `src/features/organization/components/CreateOrganizationModal/CreateOrganizationModal.tsx`
- Modify: `src/features/projects/components/CreateProjectModal/CreateProjectModal.tsx`
- Modify: `src/features/team/components/InviteMemberModal/InviteMemberModal.tsx`

**Step 1: Extract a reusable `handleBackdropKeyDown` (Escape/Space/Enter) per modal to close when focused, add `role="button"` + `tabIndex={0}` on backdrop divs only when closable, and guard focus when disabled.**

**Step 2: For knowledge dialog where backdrop disables clicks during submission, short-circuit pointer + keyboard handlers.**

**Step 3: Lint the four component files.**

Run: `npx eslint src/features/knowledge/components/KnowledgeCloudSyncDialog/KnowledgeCloudSyncDialog.tsx src/features/organization/components/CreateOrganizationModal/CreateOrganizationModal.tsx src/features/projects/components/CreateProjectModal/CreateProjectModal.tsx src/features/team/components/InviteMemberModal/InviteMemberModal.tsx`
Expected: PASS.

---

### Task 5: Organization card semantics and React entrypoint imports

**Files:**
- Modify: `src/features/organization/components/OrganizationCard/OrganizationCard.tsx`
- Modify: `src/main.tsx`

**Step 1: Convert the clickable `div` in `OrganizationCard` into a `<button type="button">` with `aria-label` fallback (organization name) and `className="am-card organization-card"`. Preserve layout styles via inline CSS or class updates.**

**Step 2: Replace `ReactDOM` default import with `createRoot`, import `StrictMode` from `react`, and keep existing StrictMode usage.**

**Step 3: Run lint on both files.**

Run: `npx eslint src/features/organization/components/OrganizationCard/OrganizationCard.tsx src/main.tsx`
Expected: PASS.

---

### Task 6: Login page tests and auth utils test cleanup

**Files:**
- Modify: `src/pages/Login/Login.test.tsx`, `src/features/auth/loginUtils.test.ts`

**Step 1: Drop unused default `React` import in `Login.test.tsx`, ensuring JSX continues to compile under the automatic runtime.**

**Step 2: For `loginUtils.test.ts`, introduce `interface StatusReadable { status?: number }` and replace `(err as any).status` usage.**

**Step 3: Lint the two test files.**

Run: `npx eslint src/pages/Login/Login.test.tsx src/features/auth/loginUtils.test.ts`
Expected: PASS.

---

### Task 7: Team invite utilities tests typing

**Files:**
- Modify: `src/features/team/teamInviteStorage.test.ts`, `src/features/team/teamRowUtils.test.ts`

**Step 1: Define `type PendingInvite` and `type MemberRow` aligned with implementation expectations (email, isUsed, expiresAt, etc.). Use these when constructing arrays instead of `any` casts.**

**Step 2: Update helper calls to leverage the strongly typed objects, ensuring `Set<string>` comparisons stay intact.**

**Step 3: Lint the two team test files.**

Run: `npx eslint src/features/team/teamInviteStorage.test.ts src/features/team/teamRowUtils.test.ts`
Expected: PASS.

---

### Task 8: Full lint verification

**Files:**
- Run: entire workspace

**Step 1: Execute the full lint suite after all edits.**

Run: `npm run lint`
Expected: PASS with no warnings.

---
