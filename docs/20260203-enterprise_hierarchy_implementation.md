# Enterprise Hierarchy Implementation Plan

This document details the technical steps to implement the **Organization -> Workspace -> Resource** model.

## 1. Database Schema Changes (PostgreSQL)

### 1.1. Organizations (New)
Root entity for billing and global membership.
```sql
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE, -- e.g. 'maple.ca'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 1.2. Workspaces (Refactoring Tenants)
Map existing `tenants` to `workspaces` and link to an Org.
```sql
ALTER TABLE tenants RENAME TO workspaces;
ALTER TABLE workspaces ADD COLUMN organization_id INTEGER REFERENCES organizations(id);
```

### 1.3. User Membership
Users now belong to an Org, with many-to-many links to Workspaces.
```sql
-- Global Org Membership
ALTER TABLE users ADD COLUMN organization_id INTEGER REFERENCES organizations(id);

-- Workspace Membership (RBAC)
CREATE TABLE workspace_members (
    user_id UUID REFERENCES users(id),
    workspace_id INTEGER REFERENCES workspaces(id),
    role VARCHAR(50) DEFAULT 'member', -- admin, member, viewer
    PRIMARY KEY (user_id, workspace_id)
);
```

## 2. Authentication Strategy (AWS Cognito)

### 2.1. Custom Claims
Update the Lambda Post-Confirmation trigger to add the following tokens to the JWT:
- `custom:organization_id`
- `custom:role`

### 2.2. Workspace Selection
The frontend will include a `x-workspace-id` header in all API requests. The backend middleware will:
1.  Verify the user (via JWT).
2.  Verify the user has access to the requested `workspace_id`.
3.  Inject the workspace context into the service layer.

## 3. API Updates

| Endpoint | Method | Change |
| :--- | :--- | :--- |
| `/organizations` | GET | List user's primary organization. |
| `/workspaces` | GET | List workspaces within the current org that the user can access. |
| `/switch-workspace` | POST | Set the current "Active" workspace context (for session-based tools). |

## 4. Console UI Impact
1.  **Workspace Switcher**: Add a dropdown in the Sidebar (likely next to the Logo) to switch between active projects.
2.  **Settings**: Add "Organization Settings" (global) vs "Workspace Settings" (local to agents).
