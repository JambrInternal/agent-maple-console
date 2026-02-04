# Agent Maple Console: Pages & Affordances

This document maps all views in the console, their relationships, and the specific actions (affordances) available to users.

---

## 🏢 Organization Level
*Context: Global management for the entire entity.*

### 1. Organization Selection
**Relationship**: Entry point. Switches context between different organizations.
**Affordances**:
- **Switch Org**: Click card to enter an organization dashboard.
- **Search**: Filter list of available organizations.
- **View Summaries**: See project counts per org at a glance.

### 2. Projects Grid
**Relationship**: Home page of an Organization.
**Affordances**:
- **Select Project**: Click site card (e.g., "Site-A Plaza") to enter Project Level.
- **Launch Project**: Provision a new job site and AI agent.
- **Hibernate Agent**: Toggle agent status to conserve tokens when site is inactive.
- **Filter/Sort**: Group sites by status (Online, Offline, Hibernating).

### 3. Team Management
**Relationship**: Accessible via Global Sidebar.
**Affordances**:
- **Invite User**: Send email invitations to new team members.
- **Assign Role**: Set permissions (Owner, Admin, Member, Viewer).
- **Remove Member**: Revoke access to the organization.
- **MFA Oversight**: View which members have multi-factor authentication active.

### 4. Billing & Workspace
**Relationship**: Accessible via Global Sidebar.
**Affordances**:
- **Adjust Plan**: Upgrade/downgrade subscription (Starter, Professional, Enterprise).
- **Update Payment**: Edit credit card or billing details.
- **Export Invoices**: Download PDF history of charges.

### 5. Usage & Limits
**Relationship**: Accessible via Global Sidebar.
**Affordances**:
- **Monitor Tokens**: Real-time view of LLM consumption against monthly limits.
- **Concurrency Tracking**: See peak simultaneous call volume.
- **Set Alerts**: Configure triggers for when usage hits percentage thresholds (80%, 90%).

---

## 🏗️ Project Level
*Context: Site-specific operations for a selected job site.*

### 6. Threads (Triage Explorer)
**Relationship**: Core operational monitoring and archive view.
**Affordances**:
- **Monitor Conversation**: Read real-time transcript of agent-human dialog.
- **Access Communication Archive**: View complete history across all channels (Voice recordings, SMS logs, Email archives).
- **Track Status**: Monitor lifecycle as agent moves thread from Needs Response to Done.
- **Reference Issue**: See which root cause the agent has linked this contact to.

### 7. Issues (Root Cause Dashboard)
**Relationship**: Analytical layer for threads.
**Affordances**:
- **Monitor Resolution**: Track agent progress in resolving the underlying problem.
- **View Stats**: See how many contacts are currently affected by this issue.
- **Access History**: Access timeline of every thread linked to this root cause.

### 8. Knowledge Base
**Relationship**: Configuration layer for the AI Agent.
**Affordances**:
- **Upload Docs**: Add PDFs, manuals, or spec sheets to agent's memory.
- **Cloud Sync**: Connect Google Drive or Dropbox folders for automated updates.
- **Monitor Index**: View live logs of the semantic ingestion pipeline.
- **Delete Source**: Remove outdated documentation from agent memory.

### 9. Tools & Skills (Agent Configuration)
**Relationship**: Behavioral and technical setup for the AI Agent.
**Affordances**:
- **Configure Skills**: Manage Escalation logic, Scheduling rules, and Document Retrieval behavior.
- **Manage Tools**: Configure integrations with outside services (Procore, Google Calendar).
- **Setup MCP Servers**: Connect and authorize Model Context Protocol servers for direct agent tooling.
- **Capability Oversight**: View exactly what the agent can do with each connected tool.

### 9. Contacts
**Relationship**: Directory for the specific project.
**Affordances**:
- **Add Contact**: Create new entries for site personnel (name, phone, email, tier).
- **Edit Contact**: Update contact details, including changing their escalation tier.

### 10. Insights Dashboard
**Relationship**: Reporting layer for site performance.
**Affordances**:
- **Date Filter**: Pivot metrics by 7d, 30d, or 90d ranges.
- **Export Report**: Generate CSV/PDF of site KPIs.
- **Trend Analysis**: Hover over charts to see daily volatility in thread volume.

---

## 📞 Channel Configuration
*Context: Platform-level settings for communication mediums.*

- **Voice Settings**: Configure Twilio numbers, IVR greetings, and carrier settings.
- **SMS Settings**: Manage text message templates, notification triggers, and auto-reply logic.
- **Email Settings**: Configure domain white-labeling, email signatures, and forwarding rules.
