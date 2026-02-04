# Sitemap & Navigation: Agent Maple Console

This structure manages the Organization -> Project hierarchy using a Supabase-inspired breadcrumb system.

---

## 1. Global Hierarchy
The navigation is driven by a top-level breadcrumb path:
`Logo / [Org Selector] / [Project Selector] / [Context/Branch] / [Page Name]`

- **Organizations View**: Lists all organizations (e.g., Iron Maple, Northern Dynamics).
- **Projects View**: Lists all projects within a selected Organization.
- **Console View**: The inner workspace for a specific project.

---

## 2. Project Navigation (Activity Bar)

### [1] Threads (Outcome: Loop Closure)
*Searchable conversation history across Phone, SMS, and Email.*
- **Recover Missed Leads**: View calls needing immediate follow-up.
- **Project Site Support**: Search technical transcripts to unblock field crews.
- **Quick Action**: "Send Document" to field operator.

### [2] Knowledge (Outcome: Reliability)
*The project's information foundation.*
- **Data Sources**: Upload and manage manuals, sit-plans, and policies.
- **Ingestion Logs**: Real-time visibility into knowledge processing and error retry.

### [3] Contacts (Outcome: Escalation)
*The human response network.*
- **Escalation Paths**: Manage Superintendents and Foremen contact info.

### [4] Insights (Outcome: Performance)
*Analytics and reliability metrics.*
- **Handling Stats**: Call volume reduction and agent success rate.
- **SLA Monitor**: Precise p75/p95 response time tracking.

### [5] Settings (System)
- **Tenant Config**: Read-only settings for Twilio and API endpoints.
- **Project Access**: Role-based visibility.

---

> [!TIP]
> **Simplicity Rule**: Every page must pass the 10/30 rule: 10 seconds to scan, 30 seconds to understand. Use plain language ("Contacts" instead of "Hierarchy Management").
