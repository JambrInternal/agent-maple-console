# Core Concepts: Agent Maple Console

These concepts form the logical foundation of the platform, ensuring consistency across design, engineering, and user experience.

---

## 1. Tools
Granular, technical functions that agents rely on directly to interact with the world.
- **Execution**: Tools are typed and native, ensuring high reliability for agent interactions.

## 2. Threads
Threads are the **mapping between one Contact and one Issue**: representing all communications with a specific person about a specific problem.
- **Structure**: Thread = Contact + Issue + Conversation History
- **Cross-channel**: A thread contains Voice, SMS, and Email messages—all in one place
- **Goal**: Threads answer the question: *"What has this person said about this issue?"*

## 3. Issues
Issues are **root causes of threads**: long-lived, analytical problems that explain *why* threads exist.
- **Operational Logic**: One **Issue** can link to many **Threads**. A **Thread** links to at most one **Issue**.
- **Impact**: Resolving an **Issue** resolves all associated open **Threads** and prevents future, similar threads.
- **Goal**: Issues answer the question: *"What keeps coming up and should be addressed?"*

## 4. Skills
Skills teach the agent how to use tools effectively. These are often formulated as **"jobs-to-be-done"**.

## 5. Channels
The medium in which humans can interact with the agent:
- **Voice**: Real-time telephony and call handling.
- **SMS**: Rapid, asynchronous text triage.
- **Email**: Formal project documentation and status updates.

---

## 6. Users
Verified human actors within the system.
- **Roles**: Defined by their permission set (e.g., Owner vs. Superintendent).
- **Access**: Users are granted access to specific Organizations or Projects.

## 7. Organizations
The legal and billing entity (e.g., *Iron Maple Construction*).
- **Control**: Manages global users, permissions, and centralized billing.
- **Silo**: All data is strictly siloed at the organizational level for security and privacy.

## 8. Projects
A physical location or distinct operation (e.g., *Site-A Plaza*).
- **Container**: Every Project has its own dedicated AI Agent, Knowledge Base, and individual project-level Contacts.
- **Independence**: Logic or data applied to one project does not affect others.

---

> [!IMPORTANT]
> **Resolution Pipeline**: **Threads** manage communication with the user. **Issues** address the cause. Resolving the **Issue** is the ultimate goal for site efficiency.
