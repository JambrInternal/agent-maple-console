# Backend Architecture

## Service Layer

The console implements a clean service layer that abstracts API interactions over the live backend.

### Identity & Access
- **Services**: `src/services/auth.ts`, `src/services/people.ts`
- **Auth Provider**: AWS Cognito (OIDC) with Bearer JWT for API requests
- **Functions**: `login()`, `logout()`, `getCurrentUser()`, `syncUser()`, `getUsers()`, `getUser(id)`
- **User Sync**: `POST /user/sync` after Cognito login to ensure the backend user record exists

### Organizations
- **Service**: `src/services/organizations.ts`
- **Functions**: `getOrganizations()`, `getOrganization(id)`
- **Note**: Organization endpoints exist in `api.yaml`, but Certly tenants still map to Projects.

### Projects
- **Service**: `src/services/projects.ts`
- **Functions**: `getProjects(orgId)`, `getProject(id)`, `updateProjectStatus(id, status)`
- **Note**: Console Projects align with Certly tenants.

### Threads & Communication
- **Service**: `src/services/threads.ts`
- **Functions**: `getThreads(projectId, filters)`, `getThread(id)`, `updateThread(id, data)`
- **Messages**: Not currently exposed in thread detail responses; UI does not display messages yet.

### Issues
- **Service**: `src/services/issues.ts`
- **Functions**: `getIssues(projectId)`, `getIssue(id)`, `createIssue(data)`, `updateIssue(id, data)`

### Knowledge Base
- **Service**: `src/services/knowledge.ts`
- **Functions**: `getKnowledgeSources(projectId)`, `uploadKnowledgeSource(projectId, file)`, `deleteKnowledgeSource(id)`

### Insights
- **Service**: `src/services/insights.ts`
- **Functions**: `getInsights(projectId, range)`
- **Status**: Not implemented. No Insights endpoints exist in `docs/architecture/api.yaml` yet.

### Tools & Skills
- **Status**: Not implemented. No Tools & Skills endpoints exist in `docs/architecture/api.yaml` yet.

### Contacts
- **Service**: `src/services/people.ts`
- **Functions**: `getContacts(projectId)`, `getContact(id)`
- **Note**: Contacts map to Certly tenant users
- **Status**: Create/update are disabled until contact-only support is confirmed in the API.

### Console Users
- **Service**: `src/services/people.ts`
- **Functions**: `getUsers(projectId?)`, `getUser(id, projectId?)`

## API Client (`src/api/client.ts`)

The client attaches:
- `Authorization: Bearer <JWT>` from `am_auth_token`
- `x-tenant-id` header when an Organization is selected (`am_tenant_id`)

Reference the Certly OpenAPI snapshot in `docs/architecture/certly-openapi.json` for endpoint contracts.

## Core Data Model

Refer to `src/api/types.ts` for full TypeScript interfaces. Key entities follow the hierarchy:
**User → Organization → Project → Thread (Contact + Issue)**
