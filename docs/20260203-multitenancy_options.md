# Multi-tenancy Models: Organizations, Workspaces, and Users

To support a scalable hierarchy of **Organizations**, **Workspaces**, and **Users**, we can consider three primary architectural patterns.

## 1. The "Enterprise" Hierarchy (Recommended)
This model treats the **Organization** as the root billing and administrative entity, with **Workspaces** as project-specific containers.

*   **Structure**: `Organization` -> `Workspace` -> `Resources`
    *   **Resources Include**:
        *   **AI Agents**: Configured personas, instructions, and behavior rules.
        *   **Knowledge/Data**: PDFs, Docs, and Vector Indices associated with the Agent.
        *   **Communication Assets**: Assigned phone numbers, call recordings, and SMS history.
        *   **Analytics**: Session evaluations and performance reports.
        *   **Contacts**: The database of users/leads specific to those agents.
*   **User Relationship**: Users are members of an Organization and can be assigned to specific Workspaces with different roles.
*   **Pros**: 
    *   Centralized administration/billing.
    *   Easily share global "Data Sources" or "Knowledge" across multiple workspaces within the same Org.
    *   Consistent user identity across the whole company.
*   **Cons**: Requires careful row-level security (RLS) to ensure users only see workspaces they are invited to.

## 2. The "Flat Multi-tenant" (Evolution)
This model maps the existing **Tenant** entity directly to a **Workspace**. An "Organization" is added as a purely logical grouping layer for multi-workspace management.

*   **Structure**: `Organization` (Grouping) -> `Tenant/Workspace` (Isolation)
*   **Identity**: Users log into an Organization and then "switch" between isolated Workspaces.
*   **Pros**: 
    *   Leverages the existing robust isolation of your `TenantId` system.
    *   Hardest security boundary between workspaces.
*   **Cons**: Harder to share resources (like a global contact list or a shared data folder) between two workspaces without duplicating data.

## 3. The "Flexible Graph"
Uses a many-to-many relationship for everything, where "Organizations" and "Workspaces" are just different types of "Account Groups".

*   **Structure**: `Account Group` (Type: Org/Work) <-> `Users`
*   **Pros**: Infinite nesting (Workspaces within Workspaces).
*   **Cons**: Highest complexity in backend logic and permission checks.

---

### Comparison Matrix

| Feature | Enterprise Hierarchy | Flat Multi-tenant |
| :--- | :--- | :--- |
| **Isolation Level** | Medium (Schema/Logic) | High (Separate Tenants) |
| **Data Sharing** | High (Cross-workspace knowledge) | Low (Siloed) |
| **Complexity** | Moderate | Low (Matches current API) |
| **UX** | Seamless Navigation | Context Switching |

## Recommendation for Agent Maple
Given the current Certly API structure:
1.  **Maintain `Tenant` as the core isolation unit** (representing a **Workspace**).
2.  **Add an `Organization` table** to represent the company.
3.  **Update `Users`** to belong to an `Organization`.
4.  **Allow Users to be "Active" in one Workspace at a time** within their Org.
