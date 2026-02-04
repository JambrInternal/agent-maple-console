# Iconography: Agent Maple Console

Icons are not just decoration; they are functional guides for the busy trades owner. We use **Lucide React** as our base library, refined with specific properties to ensure they look "crisp" and "machined."

---

## 1. Global Icon Specs
To maintain the **Industrial Navy** feel, all icons must follow these rules:

- **Library**: [Lucide React](https://lucide.dev/)
- **Stroke Width**: `1.5px` (Provides a more refined, professional look than the default 2px).
- **Size**: `20px` for primary navigation, `16px` for inline/table actions.
- **Color**: `--am-text-2` (Steel Gray) for inactive, `--am-text-1` (White) for active, and `--am-accent` (Burnt Orange) for specific branding moments.

---

## 2. Navigation Map
The following icons have been selected for the core console experience:

| View | Icon Name | Logic |
| :--- | :--- | :--- |
| **Home** | `LayoutDashboard` | High-level project overview. |
| **Threads** | `MessageSquare` | Multi-channel conversation log. |
| **Knowledge** | `Database` | The source of truth / data ingestion. |
| **Contacts** | `Users` | Escalation paths and team management. |
| **Insights** | `BarChart3` | Performance and outcome tracking. |
| **Settings** | `Settings` | System and account configurations. |

---

## 3. Detail & Context Icons
Used within threads and tables to provide immediate visual cues.

- **Channels**: `Phone` (Voice), `MessageCircle` (SMS), `Mail` (Email).
- **Actions**: `Download` (Export), `Share2` (Share), `RefreshCw` (Retry Ingestion).
- **Status**: `CheckCircle2` (Handled), `AlertCircle` (Urgent), `XCircle` (Error).

---

> [!TIP]
> **Crispness Tip**: Always ensure icons are aligned to a pixels-perfect grid. In CSS, use `display: flex` with `align-items: center` to prevent sub-pixel blurring.
