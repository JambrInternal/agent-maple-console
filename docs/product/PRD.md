# Agent Maple Console - Product Requirements

**Version**: 1.0 | **Updated**: February 4, 2026

## Overview

The Agent Maple Console is a **configuration and reporting interface** for managing AI-powered communication agents at construction job sites. It provides oversight, configuration, and analytics—not real-time conversations.

## Platform Hierarchy

```
User (authenticated)
  └── Organization (billing, users, settings)
       └── Project (job site with dedicated AI agent)
            ├── Threads (Contact + Issue mapping)
            ├── Issues (root causes)
            ├── Knowledge Base
            └── Contacts
```

## Core Concepts

| Concept | Definition |
|---------|------------|
| **Thread** | Contact + Issue mapping; all communications for one user about one issue |
| **Issue** | Root cause problem; links to many Threads (one per affected contact) |
| **Contact** | External person the AI agent interacts with |
| **Tools & Skills** | Agent capabilities and external integrations (MCP/API) |
| **Project** | Physical job site with dedicated AI agent |
| **Organization** | Billing entity, user management, security |

## Functional Requirements

### Organization Level
- **Organization Selection**: List orgs, project counts, search
- **Projects Grid**: Agent status, thread/issue rollups, launch/hibernate
- **Team**: Invite, roles (Owner/Admin/Member/Viewer), remove
- **Billing**: Plan, payment method, invoices
- **Usage**: Token consumption, concurrency, alerts
- **Settings**: Org name, auth providers, delete

### Project Level
- **Threads**: Read-only Contact+Issue view; monitor conversation and status.
- **Issues**: Read-only root cause view; monitor status and thread counts.
- **Tools & Skills**: Configure agent capabilities (Escalation, Booking) and integrations (MCP servers).
- **Knowledge Base**: Upload docs, connect sources, indexing status.
- **Contacts**: Add/edit contact details and escalation tiers.
- **Insights**: KPIs, trend charts, channel breakdown, top issues

### Channels (Configuration)
- Voice, SMS, and Email settings/provisioning. (Logs and archives are moved to Threads).

## Data Models

```
Thread: { id, project_id, contact_id, issue_id, status, created_at, updated_at }
Message: { id, thread_id, channel, direction, content, timestamp }
Issue: { id, project_id, title, status, owner_id, thread_count }
ToolSkill: { id, project_id, type, name, configuration, is_enabled }
Contact: { id, project_id, name, phone, email, escalation_tier }
```

## MVP Scope

**In**: All views above, configuration for Knowledge/Contacts/Org, reporting for Threads/Issues/Insights.
**Out**: Manual Thread/Issue management (escalate, resolve, link), real-time chat, agent config (prompts/skills), webhooks, mobile.
