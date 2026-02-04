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

## Existing Certly Endpoints (from OpenAPI)
These already exist and can be reused/mapped:
- **Auth**: `POST /user/sync` (Cognito user sync)
- **Projects (Tenants)**:
  - `GET /user/tenants` (list projects for current user)
  - `GET /admin/tenants` and related admin tenant endpoints
  - `GET/POST/PATCH/DELETE /tenants/users...` (console_users team management)
- **Knowledge Base** (Datasources):
  - `GET /datasources`
  - `POST /datasources/upload`
  - `GET /datasources/{datasource_id}`
  - `DELETE /datasources/{datasource_id}`
  - `POST /datasources/sync-google-drive`
  - `POST /datasources/sync-sharepoint`

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
2. **Projects model**: Can we formalize tenants as projects with stable identifiers?
3. **Thread/Issue storage**: Are these backed by realtime chat or separate entities?
4. **Permissions**: What roles map to `owner/admin/member/viewer` for each endpoint?
