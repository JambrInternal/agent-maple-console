# Component Library: Agent Maple Console

This library defines the visual execution of our core components, using the **Industrial Navy** theme and **Supabase** interaction patterns.

---

## 1. Breadcrumbs (Universal Context)
The most critical navigation component. It handles the Org -> Project -> Page hierarchy.

### Visual Spec
- **Font**: Inter, `--font-sm`, weight 500.
- **Color**: `--text-secondary` for inactive, `--text-primary` for active.
- **Separator**: `/` in `--border-subtle`.
- **Interaction**: Every segment is a dropdown trigger or a link.

```text
[Icon] Organization [v] / [Icon] Project Site [v] / [Icon] Page Name
```

---

## 2. Buttons (Action Atoms)
Standardizing on two primary states plus a "Ghost" state for secondary actions.

| Variant | Styling | Usage |
| :--- | :--- | :--- |
| **Primary** | Bg: `--accent-primary` (#C26A2E), Text: `#FFF` | "Connect Data", "New Project". |
| **Secondary** | Bg: `--bg-surface`, Border: `--border-subtle` | "Cancel", "View Logs". |
| **Ghost** | No Bg, Hover: `--bg-surface` | Sidebar icons, dropdown toggles. |

---

## 3. Data Cards (Information Molecules)
Used for Projects on the landing page and Ingestion status in Knowledge.

### Visual Spec
- **Background**: `--bg-surface` (#0f172a).
- **Border**: `1px solid --border-subtle`.
- **Radius**: `8px`.
- **States**: Subtle outer glow (Burnt Orange) on hover.

```text
+------------------------------------------+
| [Icon] Site-A Plaza             [ Status ] |
| ---------------------------------------- |
| 32 Leads Recovered today                 |
| Last ingestion: 2h ago                   |
+------------------------------------------+
```

---

## 4. The "Skinny" Sidebar
Persistent project-level navigation.

- **Width**: `64px`.
- **Background**: `--bg-deep` (#020617).
- **Border-Right**: `1px solid --border-subtle`.
- **Icons**: Lucide icons, sized `20px`, `--text-secondary`.
- **Active State**: Left-side vertical indicator (2px wide) in `--accent-primary`.

---

## 5. Thread Log Item
High-density conversation entries.

- **Left Rail**: Icon indicating channel (Phone, SMS, Email).
- **Center**: Name/Contact ID + Short snippet.
- **Right**: Timestamp + "Handled" or "Urgent" status badge.
- **Separator**: Bottom border `1px solid --border-subtle`.

---

> [!TIP]
> **Aesthetic Goal**: The UI should feel "machined." Keep paddings consistent (strictly 12px, 16px, or 24px) and ensure every component has a distinct focus/hover state.
