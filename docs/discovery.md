# Discovery & Context: Agent Maple Console

## 1 — Executive Summary
Agent Maple is a domain-specialized assistant (voice + SMS + email) for trades, field-service teams, and industrial operators. The Console is a **new frontend** for an existing, functional agent service. The primary goal is to empower Owners and Ops Leads to manage project communications and documentation without missed calls or burnout.

### What this business is:
- Answers calls and texts instantly (24/7)
- Handles routine requests and escalates real emergencies
- Reduces interruptions and after-hours stress

### What this business is NOT:
- Not a generic AI platform
- Not a call center replacement
- Not enterprise software jargon-heavy

---

## 2 — Requirement Gathering

### Primary User Goals
* **Never Miss Important Calls**: Instantly recover missed leads and urgent site requests.
* **Reduce Interruptions**: Handle repetitive queries (wiring, scheduling) during the day.
* **Peace of Mind**: Reliable coverage after-hours without burning out the team.
* **Multi-Channel Fluidity**: Accept voice, text, and email input interchangeably.

### Functional Requirements
1. **Enterprise Hierarchy**: Organizations manage **Projects** (Workspaces) which map to API tenants.
2. **Knowledge Management**: Visibility into ingestion health (PDFs, Manuals) with re-ingestion controls.
3. **Conversation Explorer**: Unified search across all channels (Voice, SMS, Email).
4. **Analytics**: Real-time monitoring of response times and agent accuracy.
5. **No Speculative Features**: Focus on v1 core: Home, Knowledge, Contacts, Threads, and Insights.

---

## 3 — User Personas

| Persona | Role | Mindset |
| :--- | :--- | :--- |
| **Owner / Founder** | Ops Lead / Primary Buyer | Hands-on, carries the phone, allergic to fluff, proud of reputation. |
| **General Manager** | Operations Lead | Busy, keeps jobs moving, skeptical of technical hype. |
| **Dispatch / Office** | Dispatch Supervisor | Overwhelmed by volume, needs the office to be calmer. |
| **Project Manager** | Utilities/Industrial Lead | Managing one specific project; focused on SLA and reliability. |
| **Sub Foreman** | Field Crew Leader | Onsite trade lead; needs immediate answers to unblock crews. |

### Industry focus
- **Core**: HVAC, Plumbing, Electrical, Mechanical.
- **Expanded**: Utilities (Power, Water), Industrial (Refinery, Plants), Municipal service operators.

---

## 4 — Audit & Inspiration
*   **Supabase**: For the organization/project hierarchy, breadcrumb-first navigation, and minimalist cardiovascular layout.
*   **VS Code**: Workspace pattern for high-density information.
*   **Stripe**: Onboarding UX and clean documentation.

---

## 5 — Pain Points (Daily)
- **Missed Leads**: Calls = lost jobs, especially after-hours.
- **Burnout**: Senior staff can't disconnect from the on-call phone.
- **Inconsistent Service**: Answering services are expensive and often fail to follow rules.
- **Information Bottleneck**: Admins and supervisors are overwhelmed by repetitive questions.

## 6 — MVP Scope (Locked v1)
1. **Org/Project Management**: Context-switching between API tenants.
2. **Ingestion Dashboard**: Transparency into knowledge health and manual retries.
3. **Thread Explorer**: Multi-channel search and transcript history.
4. **Escalation Contacts**: Managing who the agent reaches out to for emergencies.
