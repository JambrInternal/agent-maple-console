# Backend Architecture

## Service Layer (Mocked)

The console implements a clean service layer that abstracts API interactions. Currently, this layer uses a mock client with realistic data fixtures, allowing for rapid front-end development.

### Identity & Access
- **Service**: `src/services/users.ts`
- **Auth Provider**: AWS Cognito (OIDC)
- **Functions**: `getUsers()`, `getUser(id)`

### Organizations
- **Service**: `src/services/organizations.ts`
- **Functions**: `getOrganizations()`, `getOrganization(id)`

### Projects
- **Service**: `src/services/projects.ts`
- **Functions**: `getProjects(orgId)`, `getProject(id)`, `updateProjectStatus(id, status)`

### Threads & Communication
- **Service**: `src/services/threads.ts`
- **Functions**: `getThreads(projectId, filters)`, `getThread(id)`, `updateThread(id, data)`
- **Messages**: Managed within threads via `Message` entity.

### Issues
- **Service**: `src/services/issues.ts`
- **Functions**: `getIssues(projectId)`, `getIssue(id)`, `createIssue(data)`, `updateIssue(id, data)`

### Knowledge Base
- **Service**: `src/services/knowledge.ts`
- **Functions**: `getKnowledgeSources(projectId)`, `uploadKnowledgeSource(projectId, file)`, `deleteKnowledgeSource(id)`

### Insights
- **Service**: `src/services/insights.ts`
- **Functions**: `getInsights(projectId, range)`

## API Client (`src/api/client.ts`)

The `mockFetch` wrapper simulates network latency (300ms) and returns typed data. Scaling to a real backend requires updating the logic in `client.ts` to use standard `fetch` or `axios`.

## Core Data Model

Refer to `src/api/types.ts` for full TypeScript interfaces. Key entities follow the hierarchy:
**User → Organization → Project → Thread (Contact + Issue) → Messages**

