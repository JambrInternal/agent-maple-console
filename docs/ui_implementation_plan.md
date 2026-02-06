# Iterative UI Implementation Plan

## Methodology
To ensure high quality and catch issues early, we will implement the UI **one page at a time**. Each page will follow this cycle:
1. **Implementation**: Code the view and bind to services.
2. **Verification**: Verify affordances and responsiveness.
3. **Review**: Notify user for review/approval before proceeding.

---

## Step 0: Foundations (Theme & Shell)
*Requirement for all subsequent pages.*
1. **Design Tokens**: Implement HSL-based colors and spacing in `src/index.css`.
2. **Industrial Shell**: Create the persistent layout (`am-app-shell`) with:
   - Sidebar with nested navigation logic.
   - Header with Breadcrumbs and Context Switchers.
3. **Router Setup**: Define the nested route structure for the entire app.

---

## Iterative Page Roadmap

### 1. Organization Selection (Entry Point)
- **Goal**: Allow users to choose their operational context.
- **Features**: Card grid, search, project counts.
- **Service**: `organizations.ts`

### 2. Authentication & Login
- **Goal**: Secure the console and manage user sessions.
- **Features**: Industrial Navy login screen, session persistence, logout.
- **Service**: `auth.ts`

### 3. Projects Grid (Org Home)
- **Goal**: Dashboard for all job sites in an org.
- **Features**: Status chips (Online/Hibernating), thread rollups.
- **Service**: `projects.ts`

### 4. Threads Explorer (Project Level)
- **Goal**: High-density conversation monitoring.
- **Features**: Communication archive, live status tracking.
- **Service**: `threads.ts`

### 5. Issues Dashboard
- **Goal**: Root cause monitoring.
- **Features**: Thread count rollups, resolution trends.
- **Service**: `issues.ts`

### 6. Tools & Skills
- **Goal**: Agent capability and integration setup.
- **Features**: Skill toggles, tool configuration, MCP server setup.
- **Service**: `api/types.ts` (ToolSkill interface)

### 7. Knowledge Base
- **Goal**: RAG management.
- **Features**: File uploads, sync status, source management.
- **Service**: `knowledge.ts`

### 8. Contacts
- **Goal**: Project personnel management.
- **Features**: Add/Edit modal, escalation tier setting.
- **Service**: `people.ts`

### 9. Org Settings (Team, Billing, Usage)
- **Goal**: Admin functions.

### 10. Insights
- **Goal**: High-level reporting.


## Phase 4: View Implementation
1. **Organization/Project Selection**: Cards with status indicators.
2. **Threads/Issues**: Data tables and detail side-panels (monitoring focus).
3. **Forms**: Unified styling for Knowledge Base uploads and Contact editing.

## Phase 5: Polish
1. **Micro-animations**: Hover states and loading transitions driven by real API latency.
2. **Empty States**: Beautiful placeholders for fresh projects.
3. **Responsiveness**: Ensure the shell works on tablet/mobile (though desktop is primary).

## Verification
- Use [PAGES.md](file:///home/jeremy/workspace/agent-maple-console/docs/product/PAGES.md) affordances as a checklist.
- Verify all `src/services` are consumed correctly.
