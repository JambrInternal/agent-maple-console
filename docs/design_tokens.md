# Design Tokens: Agent Maple Console

> [!NOTE]
> **What are Design Tokens?**
> Think of Design Tokens as the **Standard Specifications** for our project. 
> 
> In construction, you don't just say "use blue paint"; you specify a precise Paint Code (e.g., Benjamin Moore Hale Navy). You don't just say "use a big bolt"; you specify a Grade 8, 1/2-inch hex head.
>
> **Design Tokens** are the same thing for our app. Instead of hardcoding a color code like `#3ecf8e` every time we build a button, we just call it `--am-accent`. If we ever want to change the "Maple Green" to a "Maple Red," we change it in **one place** (the token), and the entire app updates automatically.

These tokens form the technical foundation of our high-fidelity designs. They are modeled after the Supabase and VS Code palettes to ensure a professional, low-strain developer aesthetic.

---

## 1. Color Palette (Industrial Navy)
We use a refined "Industrial" palette: Deep Navy for depths, Steel Blue for surfaces, and Supabase Green for primary actions.

| Category | Token Name | Value | Usage |
| :--- | :--- | :--- | :--- |
| **Background** | `--bg-deep` | `#020617` | Deep Navy (App background) |
| **Surface** | `--bg-surface` | `#0f172a` | Navy Surface (Cards/Sidebars) |
| **Border** | `--border-subtle` | `#1e293b` | Steel Blue-Gray (Dividers) |
| **Accent** | `--accent-primary` | `#C26A2E` | Burnt Orange (Primary Actions) |
| **Text** | `--text-primary` | `#f8fafc` | Off-white (Headings) |
| **Text** | `--text-secondary`| `#94a3b8` | Slate Blue-Gray (Metadata) |

---

## 2. Typography
A single, clean sans-serif scale for maximum readability.

- **Font Family**: `Inter, system-ui, sans-serif`
- **Mono Family**: `JetBrains Mono, monospace` (For IDs and Logs)

| Token Name | Size | Weight | Line Height |
| :--- | :--- | :--- | :--- |
| `--font-xs` | `12px` | `400` | `1.5` |
| `--font-sm` | `14px` | `400` | `1.5` |
| `--font-md` | `16px` | `500` | `1.4` |
| `--font-lg` | `24px` | `600` | `1.2` |

---

## 3. Spacing & Radius
Geometric precision based on the 8px grid.

- **Base Unit**: `8px`
- **Border Radius**: `--radius-sm: 4px`, `--radius-md: 6px`
- **Shadow**: `0 4px 6px -1px rgba(0, 0, 0, 0.4)` (Subtle depth)

---

## 4. Theme Configuration Example (CSS)
```css
:root {
  /* Colors - Industrial Navy Theme */
  --am-bg-0: #020617;      /* Sky 950 (Deep Navy) */
  --am-bg-1: #0f172a;      /* Slate 900 (Surface) */
  --am-border: #1e293b;    /* Slate 800 (Subtle Border) */
  --am-accent: #C26A2E;    /* Brand Burnt Orange */
  
  /* Text */
  --am-text-1: #f8fafc;
  --am-text-2: #94a3b8;
  
  /* Layout */
  --sidebar-width: 64px;
  --panel-width: 280px;
}
```
