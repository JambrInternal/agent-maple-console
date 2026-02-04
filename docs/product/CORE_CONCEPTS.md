# Core Concepts

Platform terminology and data relationships.

## Thread
The **mapping between one Contact and one Issue**. Contains all communications with a specific person about a specific problem.
- Structure: Thread = Contact + Issue + Complete Communication History
- Cross-channel: Contains all Voice recordings, SMS logs, and Email archives in one place.
- **Monitor only**: The console provides oversight as the AI agent works through the thread.
- Question answered: *"What has this person said about this issue?"*

## Issue
**Root causes** explaining why threads exist.
- One Issue links to many Threads (one per affected contact)
- **Oversight only**: Use the console to monitor root cause patterns identified by agents.
- Question answered: *"What keeps coming up and should be addressed?"*

## Contact
External person the AI agent interacts with.
- Belongs to a Project
- Has escalation tier (1, 2, 3) used by the Escalation Skill
- May have multiple Threads (one per Issue)

## Tools & Skills
The **logic and capabilities** of the AI agent.
- **Skills**: Behavioral configurations (e.g., Escalation logic, Appointment booking rules).
- **Tools**: Technical integrations with outside services (e.g., Procore, Proest) and MCP servers.
- **MCP Servers**: Standardized interfaces allowing the agent to read/write to external systems securely.
- **Relationship**: A *Skill* (e.g., Scheduling) often utilizes a *Tool* (e.g., Google Calendar Integration).

## Project
Physical job site or distinct operation.
- Has dedicated AI Agent
- Contains: Knowledge Base, Contacts, Threads, Issues
- Isolated: Logic/data in one project doesn't affect others

## Organization
Legal and billing entity.
- Contains: Users, Projects, Settings
- Controls: Permissions, billing, global config
- Data siloed at org level for security

## User
Authenticated human with role-based access.
- Belongs to one or more Organizations
- Roles: Owner, Admin, Member, Viewer
- Access determined by org-level role
