# Backend Integration Plan (Deprecated)

**Status**: Superseded by `docs/architecture/BACKEND.md` and `docs/architecture/api.yaml`. The mock layer and fixtures have been removed.

## Goal
Historically described a mock API layer. Use the live service layer described in `docs/architecture/BACKEND.md` instead.

## Architecture

```
src/
├── api/
│   ├── client.ts          # API client
│   ├── types.ts           # TypeScript interfaces
│   └── index.ts           # Re-exports
├── services/
│   ├── organizations.ts   # Org CRUD
│   ├── projects.ts        # Project CRUD
│   ├── threads.ts         # Thread operations
│   ├── issues.ts          # Issue operations
│   ├── people.ts          # Contacts + console users
│   ├── knowledge.ts       # Knowledge base
│   ├── insights.ts        # Analytics/metrics
│   └── index.ts           # Re-exports
```

---

## Types (src/api/types.ts)

```typescript
// Core entities
interface User { id, email, name, role }
interface Organization { id, name, projectCount, createdAt }
interface Project { id, orgId, name, agentStatus, threadCount, issueCount }
interface Thread { id, projectId, contactId, issueId, status, createdAt, updatedAt }
interface Issue { id, projectId, title, status, ownerId, threadCount, createdAt }
interface Contact { id, projectId, name, phone, email, escalationTier }
interface Message { id, threadId, channel, direction, content, timestamp }
interface KnowledgeSource { id, projectId, name, type, status, documentCount }

// Enums
type AgentStatus = 'online' | 'syncing' | 'hibernating' | 'offline'
type ThreadStatus = 'open' | 'needs_response' | 'waiting' | 'done'
type IssueStatus = 'open' | 'resolved'
type Channel = 'voice' | 'sms' | 'email'
type MessageDirection = 'inbound' | 'outbound'
```

---

## Service Functions

### Organizations
| Function | Signature | Description |
|----------|-----------|-------------|
| `getOrganizations` | `() => Organization[]` | List user's orgs |
| `getOrganization` | `(id) => Organization` | Get single org |

### Projects
| Function | Signature | Description |
|----------|-----------|-------------|
| `getProjects` | `(orgId) => Project[]` | List projects in org |
| `getProject` | `(id) => Project` | Get single project |
| `updateProjectStatus` | `(id, status) => Project` | Change agent status |

### Threads
| Function | Signature | Description |
|----------|-----------|-------------|
| `getThreads` | `(projectId, filters?) => Thread[]` | List threads |
| `getThread` | `(id) => Thread & { issue, contact }` | Get thread detail |

### Issues
| Function | Signature | Description |
|----------|-----------|-------------|
| `getIssues` | `(projectId) => Issue[]` | List issues |
| `getIssue` | `(id) => Issue & { threads }` | Get issue with threads |
| `createIssue` | `(data) => Issue` | Create new issue (API pending) |
| `updateIssue` | `(id, data) => Issue` | Update status, owner (API pending) |

### Contacts
| Function | Signature | Description |
|----------|-----------|-------------|
| `getContacts` | `(projectId) => Contact[]` | List contacts |
| `getContact` | `(id, projectId?) => Contact` | Get single contact |
| `createContact` | `(data) => Contact` | Add contact (API pending) |
| `updateContact` | `(id, data) => Contact` | Edit contact (API pending) |

### Knowledge
| Function | Signature | Description |
|----------|-----------|-------------|
| `getSources` | `(projectId) => KnowledgeSource[]` | List sources |
| `uploadSource` | `(projectId, file) => KnowledgeSource` | Upload document |
| `deleteSource` | `(id) => void` | Remove source |

### Insights
| Function | Signature | Description |
|----------|-----------|-------------|
| `getInsights` | `(projectId, range) => InsightMetrics` | Get dashboard data |

---

## Mock Data Requirements (Removed)

### Organizations (2)
- Iron Maple Construction (3 projects)
- Bushy Tailed Contracting (2 projects)

### Projects (5 total)
- Site-A Plaza (online, 12 threads, 3 issues)
- Site-B Warehouse (syncing, 8 threads, 2 issues)
- Downtown Tower (hibernating, 0 threads, 0 issues)
- North Campus (online, 15 threads, 4 issues)
- Retail Complex (offline, 5 threads, 1 issue)

### Threads (40 total)
Realistic construction conversations across Voice, SMS, Email

### Issues (10 total)
- Document requests (L3 Wiring specs)
- Gate access codes
- Delivery scheduling
- Safety inspections
- Parking allocation

---

## Implementation Order

1. [ ] Create `src/api/types.ts` with all interfaces
2. [ ] Create `src/mocks/` with fixture data
3. [ ] Create `src/api/client.ts` with mock delay wrapper
4. [ ] Create service files with mock implementations
5. [ ] Export everything from index files
6. [ ] Update docs with API reference

---

## Swap Strategy

When ready to connect real backend:
1. Update `src/api/client.ts` to use `fetch` instead of mock
2. Service function signatures stay the same
3. Components don't need to change
