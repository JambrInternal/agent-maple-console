# Certly Console API Design (Draft)

**Purpose**: Define the API surface needed by the Agent Maple Console. This is a forward-looking design that maps current Certly endpoints where possible and lists missing endpoints required by the console (Organizations, Projects, Threads, Issues, Contacts, Tools & Skills, Insights).

## Principles
- **Console is configuration + reporting**, not realtime chat.
- Use **Organization / Project / Thread / Issue / Contact / Console User** terminology (console terms). Map to existing Certly models where needed.
- Prefer **consistent, predictable endpoints**, with pagination and filtering on list routes.
- Keep **auth** consistent with existing Bearer JWT + `x-tenant-id` for Organization context.
- Keep **Console Users** and **Contacts** as separate concepts, even if they share storage today.

## Terminology Mapping
- **Project** = Certly **Tenant** (`tenant_id`) **today**
- **Organization** = Console grouping above Projects (**not represented in Certly yet**)
- **Console User** = Authenticated console user (Cognito + Certly user record)
- **Thread** = Messaging history and agent activity across multiple channels about a topic/issue with a contact
- **Issue** = A topic of conversation, a Possible problem, the solution that resolves one or more threads
- **Contact** = Certly **Tenant User** (current)

## Status (February 4, 2026)
- OpenAPI snapshot: `docs/architecture/certly-openapi.json`
- Console live calls now include:
  - `POST /user/sync`
  - `GET /organizations`, `GET /organizations/{organization_id}`
  - `GET /organizations/{organization_id}/projects`, `GET /projects/{project_id}`
  - `POST /admin/tenants/{tenant_id}/disable` (agent status)
  - `GET /projects/{project_id}/threads`, `GET /threads/{thread_id}`
  - `GET /projects/{project_id}/issues`, `GET /issues/{issue_id}`
  - `GET /tenants/users` (Contacts + Console Users)
  - `GET /datasources`, `GET /datasources/{datasource_id}`, `POST /datasources/upload`, `DELETE /datasources/{datasource_id}`, `POST /datasources/{datasource_id}/reprocess`
- Missing surfaces are tracked below.

## Existing Certly Endpoints (from OpenAPI)
These already exist and can be reused/mapped:
- **Auth**: `POST /user/sync` (Cognito user sync)
- **Projects (Tenants)**:
  - `GET /user/tenants` (list tenants for current user)
  - `GET /admin/tenants` and `GET /admin/tenants/{tenant_id}`
  - `POST /admin/tenants/{tenant_id}/disable`
- **Tenant Users (Console Users or Contacts)**:
  - `GET /tenants/users`
  - `POST /tenants/users`
  - `PATCH /tenants/users/{user_id}`
  - `GET /tenants/users/{user_id}/permissions`
  - `POST /tenants/send-invitation`
  - `POST /tenants/create-and-invite-user`
- **Knowledge Base** (Datasources):
  - `GET /datasources`
  - `POST /datasources/upload`
  - `GET /datasources/{datasource_id}`
  - `DELETE /datasources/{datasource_id}`
  - `POST /datasources/{datasource_id}/reprocess`
  - `POST /datasources/sync-google-drive`
  - `POST /datasources/sync-sharepoint`

## Gap Analysis (Console vs Certly OpenAPI)

| Console Surface | Needed Endpoints (current console) | Certly OpenAPI Status | Required Change |
| --- | --- | --- | --- |
| Auth + User Sync | `POST /user/sync` | Exists | None |
| Organizations | `GET /organizations`, `GET /organizations/{id}`, `PATCH /organizations/{id}` | Missing | Add an Organization layer and change console to treat tenants as Projects |
| Projects | `GET /organizations/{org_id}/projects`, `GET /projects/{id}`, `PATCH /projects/{id}` | Partial via tenants | Add org scoping plus project fields (`agentStatus`, `threadCount`, `issueCount`, `lastActivityAt`) |
| Console Users (Team) | `GET/POST/PATCH/DELETE /console_users` | Partial via `/tenants/users` and invitation endpoints | Map or rename to console users and add role mapping plus MFA status |
| Contacts | `GET/POST/PATCH /contacts` | Missing as a distinct resource | Separate Contacts from console users and add escalation tier fields |
| Threads | `GET /projects/{project_id}/threads`, `GET /threads/{id}`, `PATCH /threads/{id}` | Missing | Add thread storage, list, and detail endpoints with filters |
| Messages | `GET /threads/{thread_id}/messages` | Missing | Add message list or embed messages in thread detail response |
| Issues | `GET /projects/{project_id}/issues`, `GET /issues/{id}`, `POST /projects/{project_id}/issues`, `PATCH /issues/{id}` | Missing | Add issue storage, list, and detail endpoints |
| Knowledge Base | `GET /datasources`, `POST /datasources/upload`, `DELETE /datasources/{id}`, `POST /datasources/{id}/reprocess` | Exists | Map datasource fields to `KnowledgeSource` and include tenant mapping |
| Tools & Skills | `GET /projects/{project_id}/tools-skills`, `PATCH /tools-skills/{id}` | Missing | Add tools and skills configuration endpoints |
| Insights | `GET /projects/{project_id}/insights` | Missing | Add metrics aggregation endpoint |

## Field Mapping Notes (from OpenAPI)

### TenantResponse -> Project
| Console Field | Certly Field | Notes |
| --- | --- | --- |
| `id` | `id` | Cast to string |
| `name` | `name` | Fallback if null |
| `agentStatus` | `is_disabled` | Map `true` to `offline`, `false` to `online` |
| `createdAt` | `created_at` | Use ISO string |
| `organizationId` | Missing | Requires Organization layer |
| `threadCount` | Missing | Requires aggregation |
| `issueCount` | Missing | Requires aggregation |
| `lastActivityAt` | Missing | Requires aggregation |

### TenantUserResponse -> Contact or Console User
| Console Field | Certly Field | Notes |
| --- | --- | --- |
| `id` | `user_id` | String |
| `projectId` | `tenant_id` | Cast to string |
| `name` | `given_name` + `family_name` | Concatenate with fallback |
| `email` | `email` | Optional in Certly |
| `phone` | `phone_number` | Optional in Certly |
| `role` | `role` | Certly roles are `ADMIN/INSTRUCTOR/LEARNER` |
| `mfaEnabled` | Missing | Requires backend support |
| `escalationTier` | Missing | Requires backend support |
| `threadCount` | Missing | Requires aggregation |
| `isBlocked` | Missing | Requires backend support |
| `company` | Missing | Requires backend support |

**Note**: `TenantUserResponse` does not expose `is_contact_only`, so the console cannot reliably separate Contacts from Console Users yet. We treat `/tenants/users` as a shared directory until the backend exposes a contact-only flag.

### DatasourceDetailResponse -> KnowledgeSource
| Console Field | Certly Field | Notes |
| --- | --- | --- |
| `id` | `id` | Cast to string |
| `projectId` | `tenant_id` | Cast to string |
| `name` | `file_name` | |
| `type` | `source` or `content_type` | Map to `pdf`, `doc`, `google_drive`, `dropbox` |
| `status` | `embedding_status` | Map `NOT_STARTED/IN_PROGRESS/COMPLETED/FAILED` to `pending/indexing/ready/error` |
| `createdAt` | `created_at` | Use ISO string |
| `lastSyncAt` | `updated_at` | Use ISO string |
| `documentCount` | Missing | Requires new field or derived from file chunks |

## Proposed Console API (Missing Surface)

### Organizations
Organizations do not exist in Certly yet. They need a first-class API surface
or a gateway that groups existing tenants into Organizations.

```
GET  /organizations
GET  /organizations/{organization_id}
PATCH /organizations/{organization_id}
```

**Notes**
- `GET /organizations` **cannot** be an alias of `GET /user/tenants` if tenants map to Projects.

**OpenAPI (api.yaml snippet)**
```yaml
paths:
  /organizations:
    get:
      tags: [Organizations]
      summary: List organizations
  /organizations/{organization_id}:
    get:
      tags: [Organizations]
      summary: Get organization
    patch:
      tags: [Organizations]
      summary: Update organization
```
- Response should map to `Organization` in `src/api/types.ts`.

### Projects
Projects map to Certly tenants today. The console still needs a stable API surface:

```
GET  /organizations/{organization_id}/projects
GET  /projects/{project_id}
PATCH /projects/{project_id}
```

**Fields (Project)**
- `id`, `organization_id`, `name`, `agent_status`, `thread_count`, `issue_count`, `last_activity_at`, `created_at`

### Console Users
Console users are internal, authenticated users. Use `console_users` to avoid confusion with Contacts.

```
GET    /organizations/{organization_id}/console_users
POST   /organizations/{organization_id}/console_users
PATCH  /console_users/{console_user_id}
DELETE /console_users/{console_user_id}
```

**Notes**
- Likely backing endpoints: `/tenants/users` and `/admin/tenants/{tenant_id}/users`.
- Invitations can use `/tenants/send-invitation` and `/tenants/create-and-invite-user`.

**OpenAPI (api.yaml snippet)**
```yaml
paths:
  /organizations/{organization_id}/console_users:
    get:
      tags: [Console Users]
      summary: List console users for an organization
    post:
      tags: [Console Users]
      summary: Create or invite console user
  /console_users/{console_user_id}:
    patch:
      tags: [Console Users]
      summary: Update console user
    delete:
      tags: [Console Users]
      summary: Remove console user
```

**OpenAPI (api.yaml snippet)**
```yaml
paths:
  /organizations/{organization_id}/projects:
    get:
      tags: [Projects]
      summary: List projects for organization
      parameters:
        - name: organization_id
          in: path
          required: true
          schema: { type: string }
  /projects/{project_id}:
    get:
      tags: [Projects]
      summary: Get project
    patch:
      tags: [Projects]
      summary: Update project
```

### Threads
The console is read-only for threads (monitoring), with optional status updates.

```
GET   /projects/{project_id}/threads
GET   /threads/{thread_id}
PATCH /threads/{thread_id}  // optional: status, issue_id
```

**Filters**
- `status`, `issue_id`, `contact_id`, `channel`, `page`, `page_size`

**OpenAPI (api.yaml snippet)**
```yaml
paths:
  /projects/{project_id}/threads:
    get:
      tags: [Threads]
      summary: List threads for a project
      parameters:
        - name: project_id
          in: path
          required: true
          schema: { type: string }
  /threads/{thread_id}:
    get:
      tags: [Threads]
      summary: Get thread
    patch:
      tags: [Threads]
      summary: Update thread
```

### Issues

```
GET   /projects/{project_id}/issues
GET   /issues/{issue_id}
POST  /projects/{project_id}/issues
PATCH /issues/{issue_id}
```

**Filters**
- `status`, `page`, `page_size`

**OpenAPI (api.yaml snippet)**
```yaml
paths:
  /projects/{project_id}/issues:
    get:
      tags: [Issues]
      summary: List issues for a project
    post:
      tags: [Issues]
      summary: Create issue
  /issues/{issue_id}:
    get:
      tags: [Issues]
      summary: Get issue
    patch:
      tags: [Issues]
      summary: Update issue
```

### Contacts

```
GET   /projects/{project_id}/contacts
GET   /contacts/{contact_id}
POST  /projects/{project_id}/contacts
PATCH /contacts/{contact_id}
```

**Filters**
- `query` (name/email/phone), `page`, `page_size`

**Notes**
- Contacts currently map to **tenant users** in Certly.
- Likely backing endpoints: `/tenants/users` and `/admin/tenants/{tenant_id}/users`.

**OpenAPI (api.yaml snippet)**
```yaml
paths:
  /projects/{project_id}/contacts:
    get:
      tags: [Contacts]
      summary: List contacts for a project
    post:
      tags: [Contacts]
      summary: Create contact
  /contacts/{contact_id}:
    get:
      tags: [Contacts]
      summary: Get contact
    patch:
      tags: [Contacts]
      summary: Update contact
```

### Tools & Skills
Configuration surface for agent capabilities.

```
GET   /projects/{project_id}/tools-skills
PATCH /tools-skills/{tool_skill_id}
```

**OpenAPI (api.yaml snippet)**
```yaml
paths:
  /projects/{project_id}/tools-skills:
    get:
      tags: [Tools & Skills]
      summary: List tools and skills for a project
  /tools-skills/{tool_skill_id}:
    patch:
      tags: [Tools & Skills]
      summary: Update tool or skill configuration
```

### Insights
Rollups for reporting.

```
GET /projects/{project_id}/insights?start=YYYY-MM-DD&end=YYYY-MM-DD
```

**Fields (InsightMetrics)**
- `total_threads`, `open_issues`, `avg_resolution_time_hours`, `auto_resolved_percent`,
  `thread_trend`, `channel_breakdown`, `top_issues`

**OpenAPI (api.yaml snippet)**
```yaml
paths:
  /projects/{project_id}/insights:
    get:
      tags: [Insights]
      summary: Get project insights
      parameters:
        - name: project_id
          in: path
          required: true
          schema: { type: string }
        - name: start
          in: query
          required: true
          schema: { type: string, format: date }
        - name: end
          in: query
          required: true
          schema: { type: string, format: date }
      responses:
        "200":
          description: Insight metrics
```

### Insights (Fine-Grained)
Add these only if the summary endpoint becomes too heavy.

```
GET /projects/{project_id}/insights/threads-trend
GET /projects/{project_id}/insights/channel-breakdown
GET /projects/{project_id}/insights/top-issues
```

**OpenAPI (api.yaml snippet)**
```yaml
paths:
  /projects/{project_id}/insights/threads-trend:
    get:
      tags: [Insights]
      summary: Get thread trend for a project
  /projects/{project_id}/insights/channel-breakdown:
    get:
      tags: [Insights]
      summary: Get channel breakdown for a project
  /projects/{project_id}/insights/top-issues:
    get:
      tags: [Insights]
      summary: Get top issues for a project
```

## Response Conventions
Continue using the Certly response wrapper to keep parity:

```
{
  "code": 200,
  "success": true,
  "message": "",
  "data": ...
}
```

**Pagination**
```
{
  "data": [...],
  "total": 123,
  "page": 1,
  "page_size": 25
}
```

## Auth + Headers
- `Authorization: Bearer <JWT>` required for all console endpoints
- `x-tenant-id` is the **Project** (tenant) context in the current Certly API

## Open Questions
1. **Projects model**: Can we formalize tenants as projects with stable identifiers?
2. **Thread/Issue storage**: Are these backed by realtime chat or separate entities?
3. **Permissions**: What roles map to `owner/admin/member/viewer` for each endpoint?
