# Agent Maple Design Principles

These principles guide the evolution of the Agent Maple Console, ensuring a premium, efficient, and user-centric experience inspired by **Supabase**, **VS Code**, and **Stripe**.

---

## 1. Personality & Tone (Brand Guidelines)
The app is a **sales assistant**, not a brochure. It should feel like "the best dispatcher you’ve ever worked with."

- **Personality**: Practical, Calm, Reliable, No hype.
- **Voice**: Short sentences, plain language, outcome-focused.
- **Audience**: Busy blue-collar owners and ops leads. Respect the work.

## 2. Copy & Messaging Rules
- **Say this more**: Missed calls, after-hours coverage, emergency vs routine, peace of mind, protecting reputation, instant response.
- **Say this less**: AI models, automation frameworks, technical architecture, marketing buzzwords ("revolutionary", "next-gen").
- **10/30 Rule**: If a page takes >10 seconds to scan or >30 seconds to understand, it's too long.

## 3. Visual Clarity & Trust (Industrial Excellence)
The UI must feel as reliable as a high-quality tool on a job site.

- **Consistent Typography & Hierarchy**: Use a refined sans-serif (Inter) with generous whitespace.
- **Status Transparency**: Every background process (ingestion, sync) must have a visible, real-time status indicator.
- **Human-Centric Language**: Use "Connect Data Source" instead of "Initialize ETL Pipeline". Avoid explainining AI internals.

## 3. High-Density Utility

For power users, density is a feature, provided it is well-organized.

-   **Grid-Based Information**: Use structured tables and lists with hover-state actions to maximize screen real estate without clutter.
-   **Quick Actions**: Common operations (e.g., "Add Contact", "Run Insight") should be accessible within one click or a keyboard shortcut.
-   **Unified Iconography**: Stick to a single icon library (Lucide) with consistent stroke weights and sizes.

## 4. Simplicity Bias (Agent Rules)
- If two approaches meet the same goal, choose the **simpler design and implementation**.
- Propose the 80/20 scope tradeoff before adding complexity.
- v1 Scope is locked: Home, Knowledge, Contacts, Threads, and Insights only.
- No pricing, no specultive features, no feature sprawl.

---

## Technical Recommendations

-   **Theme System**: Implement a CSS Variable-based theme system supporting both a high-contrast Light mode and a sleek Dark mode ("Midnight Maple").
-   **Component Library**: Standardize on a core set of components (Buttons, Inputs, Modals) with extreme attention to detail (border-radii, shadows, focus states).
