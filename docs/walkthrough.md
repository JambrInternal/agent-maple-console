# Walkthrough: Backend Service Layer

The console uses a service layer in the `src` directory to abstract API calls to the live backend.

## Architecture Overview

The system is organized into three main layers:

1.  **API Layer (`src/api/`)**: Defines TypeScript types and the API client.
2.  **Service Layer (`src/services/`)**: CRUD functions and business logic that components will call directly.

```mermaid
graph LR
    UI[React Components] --> S[Service Layer]
    S --> C[API Client]
```

## Available Services

| Service | File | Purpose |
| :--- | :--- | :--- |
| **Organizations** | `services/organizations.ts` | List and fetch organizations. |
| **Projects** | `services/projects.ts` | Manage job sites and agent status. |
| **Threads** | `services/threads.ts` | Triage conversations (Contact + Issue mapping). |
| **Issues** | `services/issues.ts` | Track root cause issues and patterns. |
| **Contacts** | `services/people.ts` | Manage site contacts. |
| **Knowledge** | `services/knowledge.ts` | RAG data sources and indexing status. |
| **Insights** | `services/insights.ts` | High-level analytics and reporting data. |

## Example Usage

To fetch threads for a project:

```typescript
import { getThreads } from './services/threads';

const threads = await getThreads('proj_1', { status: 'open' });
console.log(threads);
```

To fetch full thread details:

```typescript
import { getThread } from './services/threads';

const thread = await getThread('thread_1');
console.log(thread.contact.name);
console.log(thread.issue.title);
```

## Next Steps

Now that the data layer is ready, we can proceed with:
1.  **CSS Variable Setup**: Implementing the "Industrial Navy" theme tokens.
2.  **Global Shell Implementation**: Building the responsive sidebar and breadcrumb layout.
3.  **View Development**: Wiring up the services to real React components.
