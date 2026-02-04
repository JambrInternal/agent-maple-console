# Walkthrough: Mock Backend Service Layer

I have implemented a comprehensive mock backend service layer in the `src` directory. This provides a clean foundation for building the React frontend while simulating a real backend environment.

## Architecture Overview

The system is organized into three main layers:

1.  **API Layer (`src/api/`)**: Defines TypeScript types and a mock client with network delay simulation.
2.  **Mock Data (`src/mocks/`)**: Realistic data fixtures for all core entities (Iron Maple Construction, Site-A Plaza, etc.).
3.  **Service Layer (`src/services/`)**: CRUD functions and business logic that components will call directly.

```mermaid
graph LR
    UI[React Components] --> S[Service Layer]
    S --> C[Mock API Client]
    C --> M[Mock Data Fixtures]
```

## Available Services

| Service | File | Purpose |
| :--- | :--- | :--- |
| **Organizations** | `services/organizations.ts` | List and fetch organizations. |
| **Projects** | `services/projects.ts` | Manage job sites and agent status. |
| **Threads** | `services/threads.ts` | Triage conversations (Contact + Issue mapping). |
| **Issues** | `services/issues.ts` | Track root cause issues and patterns. |
| **Contacts** | `services/contacts.ts` | Manage site contacts and escalation tiers. |
| **Knowledge** | `services/knowledge.ts` | RAG data sources and indexing status. |
| **Insights** | `services/insights.ts` | High-level analytics and reporting data. |

## Example Usage

To fetch threads for a project:

```typescript
import { getThreads } from './services/threads';

const threads = await getThreads('proj_1', { status: 'open' });
console.log(threads);
```

To fetch full thread details with messages:

```typescript
import { getThread } from './services/threads';

const thread = await getThread('thread_1');
console.log(thread.contact.name);
console.log(thread.messages);
```

## Mock Data Context

I have populated the system with realistic construction data:
*   **Organizations**: Iron Maple Construction, Bushy Tailed Contracting.
*   **Issues**: Missing L3 Wiring Specs, Gate Access Code Questions, etc.
*   **Contacts**: Dave Morrison (Morrison Electric), Lisa Park (City Inspector), etc.
*   **Threads**: Conversations across Voice, SMS, and Email channels.

## Next Steps

Now that the data layer is ready, we can proceed with:
1.  **CSS Variable Setup**: Implementing the "Industrial Navy" theme tokens.
2.  **Global Shell Implementation**: Building the responsive sidebar and breadcrumb layout.
3.  **View Development**: Wiring up the services to real React components.
