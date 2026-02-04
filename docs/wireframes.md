# Redesigned Wireframes: Agent Maple Console (Supabase Style)

These wireframes focus on the absolute clarity of the **Hierarchy** and **Navigation**, modeled after the Supabase dashboard.

---

## 1. Organizations Landing Page
The entry point after login. Users see their organizations and can create new ones.

```text
__________________________________________________________________________________________
[ Logo ] / Organizations                                              [Search] [User Icon]
__________________________________________________________________________________________

  Your Organizations

  [ Search Organizations... ]                                    [ + New Organization ]

  +--------------------------+    +--------------------------+
  | [Icon] Bushy Tailed      |    | [Icon] SnapTrade         |
  | Free Plan • 1 project    |    | Pro Plan • 3 projects    |
  +--------------------------+    +--------------------------+
__________________________________________________________________________________________
```

---

## 2. Organization Project View
After selecting an organization (e.g., "Bushy Tailed"), the user sees projects within that org.

```text
__________________________________________________________________________________________
[ Logo ] / Bushy Tailed [FREE] [v] / Projects                         [Search] [User Icon]
__________________________________________________________________________________________

  Projects

  [ Search for a project... ] [Filter]                           [ List/Grid ] [ + New Project ]

  +--------------------------+
  | [Icon] unity-zoo         |  [ ... ]
  | AWS | us-east-1           |
  | [ PAUSED ]                |
  | [ (i) Project is paused ] |
  +--------------------------+
__________________________________________________________________________________________
```

---

## 3. Inner Project Workspace (The "Console")
This is the core view for a selected project (e.g., "unity-zoo"). Note the deep breadcrumb.

```text
__________________________________________________________________________________________
[ Logo ] / Bushy Tailed [v] / unity-zoo [v] / main [PROD] [v] / [ Threads   ]  [User Icon]
__________________________________________________________________________________________
|    |                                                                                   |
| (H)|  Threads                                                                          |
|    |                                                                                   |
| (T)|  [ Search threads...           ]          [ Filter ] [ + New Thread ]             |
|    |  ___________________________________________________________________________      |
| (K)|  |                                                                         |     |
|    |  | [Icon] Voice Call: Joe (GC Superintendent)             [ Active ]       |     |
| (C)|  | Today, 10:30 AM | "Need the wiring manual for Level 3..."               |     |
|    |  |_________________________________________________________________________|     |
| (I)|  |                                                                         |     |
|    |  | [Icon] SMS: Sub Foreman B                               [ Pending ]      |     |
|    |  | Yesterday, 4:45 PM | "Confirmed receipt of safety policy."               |     |
|____|__|_________________________________________________________________________|_____|
|    |                                                                                   |
| (S)|  (Status Bar: p75 Response 2.4s | Connected to Node Alpha)                        |
|____|___________________________________________________________________________________|
```

### Navigation Map (Sidebar Icons)
- **(H) Home**: Project overview and quick links.
- **(T) Threads**: All conversation logs (Voice, SMS, Email).
- **(K) Knowledge**: Data sources, ingestion logs, and retry tools.
- **(C) Contacts**: Escalation contacts (Superintendents, Foremen).
- **(I) Insights**: Performance metrics and call reduction stats.
- **(S) Settings**: Bottom-aligned project/org settings.

---

## 4. Interaction: Interactive Breadcrumbs
The breadcrumb segments are the primary way to jump levels:
- Click **"Bushy Tailed"** to switch organizations.
- Click **"unity-zoo"** to switch projects within the organization.
- Click **"main"** to switch environments or branches.
- Click the final segment (e.g., **"Threads"**) to quickly jump to another page (Knowledge, Contacts).
