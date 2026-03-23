# Agent Maple Console Design Tokens (Comprehensive v2)

Last updated: 2026-03-22

## 1. Purpose
This document defines a complete token system for Agent Maple Console so styles can be consistent across light/dark themes and interaction states.

Goals:
- Cover component states (`default`, `hover`, `active/pressed`, `focus-visible`, `disabled`).
- Normalize typography with familiar aliases (`text-sm`, `text-base`) and spacing with semantic axis tokens (`spacing-inline-s`, `spacing-stack-m`, `spacing-inset-l`).
- Preserve the existing visual language (Industrial Navy + brand orange) while reducing hardcoded color usage.

## 2. Token Layers
Use tokens in this order (do not skip layers):

1. `Foundation` tokens: raw palette values (brand + neutral ramps).
2. `Semantic` tokens: meaning-based tokens (`surface`, `text`, `border`, `success`, `danger`, etc.).
3. `Component` tokens: control-specific contracts (`button`, `input`, `table`, `badge`, etc.).

Naming rule:
- Prefix all tokens with `--am-`.
- Prefer semantic/component tokens in product code.
- Use foundation tokens only inside token definitions.

## 3. Canonical Theme Tokens

### 3.1 Dark Theme (`:root`)
```css
:root {
  /* Foundation: brand */
  --am-color-brand-400: #d78a55;
  --am-color-brand-500: #c26a2e;
  --am-color-brand-600: #a95b27;
  --am-color-brand-700: #8f4c20;

  /* Foundation: neutral */
  --am-color-slate-50: #f8fafc;
  --am-color-slate-100: #f1f5f9;
  --am-color-slate-200: #e2e8f0;
  --am-color-slate-300: #cbd5e1;
  --am-color-slate-400: #94a3b8;
  --am-color-slate-500: #64748b;
  --am-color-slate-600: #475569;
  --am-color-slate-700: #334155;
  --am-color-slate-800: #1e293b;
  --am-color-slate-900: #0f172a;
  --am-color-slate-950: #020617;

  /* Semantic: surface/text/border */
  --am-surface-canvas: #020617;
  --am-surface-default: #0f172a;
  --am-surface-elevated: #13203a;
  --am-surface-muted: rgba(15, 23, 42, 0.6);

  --am-border-default: #1e293b;
  --am-border-muted: rgba(30, 41, 59, 0.7);
  --am-border-strong: rgba(148, 163, 184, 0.5);

  --am-text-primary: #f8fafc;
  --am-text-secondary: #94a3b8;
  --am-text-tertiary: #64748b;
  --am-text-inverse: #0f172a;

  /* Semantic: feedback */
  --am-success-fg: #22c55e;
  --am-success-bg: rgba(34, 197, 94, 0.12);
  --am-success-border: rgba(34, 197, 94, 0.3);

  --am-warning-fg: #f59e0b;
  --am-warning-bg: rgba(245, 158, 11, 0.12);
  --am-warning-border: rgba(245, 158, 11, 0.3);

  --am-danger-fg: #ef4444;
  --am-danger-bg: rgba(239, 68, 68, 0.12);
  --am-danger-border: rgba(239, 68, 68, 0.3);

  --am-info-fg: #38bdf8;
  --am-info-bg: rgba(56, 189, 248, 0.12);
  --am-info-border: rgba(56, 189, 248, 0.3);

  /* Semantic: interaction */
  --am-overlay-hover: rgba(255, 255, 255, 0.05);
  --am-overlay-active: rgba(255, 255, 255, 0.1);
  --am-overlay-selected: rgba(194, 106, 46, 0.12);
  --am-overlay-disabled: rgba(15, 23, 42, 0.45);
  --am-focus-ring: 0 0 0 2px rgba(194, 106, 46, 0.3);
  --am-focus-ring-strong: 0 0 0 3px rgba(194, 106, 46, 0.4);

  /* Legacy compatibility aliases */
  --am-bg-0: var(--am-surface-canvas);
  --am-bg-1: var(--am-surface-default);
  --am-border: var(--am-border-default);
  --am-text-1: var(--am-text-primary);
  --am-text-2: var(--am-text-secondary);
  --am-accent: var(--am-color-brand-500);

  /* Table aliases (existing) */
  --am-table-head-bg: var(--am-surface-muted);
  --am-table-head-text: var(--am-text-secondary);
  --am-table-row-border: var(--am-border-muted);
  --am-table-row-hover: rgba(15, 23, 42, 0.5);
  --am-table-row-bg: transparent;
}
```

### 3.2 Light Theme (`:root[data-theme="light"]`)
```css
:root[data-theme="light"] {
  --am-surface-canvas: #f8fafc;
  --am-surface-default: #ffffff;
  --am-surface-elevated: #ffffff;
  --am-surface-muted: #f8fafc;

  --am-border-default: #e2e8f0;
  --am-border-muted: #e2e8f0;
  --am-border-strong: #cbd5e1;

  --am-text-primary: #0f172a;
  --am-text-secondary: #475569;
  --am-text-tertiary: #64748b;
  --am-text-inverse: #f8fafc;

  --am-success-bg: #ecfdf3;
  --am-success-border: #86efac;

  --am-warning-bg: #fffbeb;
  --am-warning-border: #fcd34d;

  --am-danger-bg: #fef2f2;
  --am-danger-border: #fca5a5;

  --am-info-bg: #f0f9ff;
  --am-info-border: #7dd3fc;

  --am-overlay-hover: rgba(15, 23, 42, 0.04);
  --am-overlay-active: rgba(15, 23, 42, 0.08);
  --am-overlay-selected: rgba(194, 106, 46, 0.1);
  --am-overlay-disabled: rgba(148, 163, 184, 0.2);
  --am-focus-ring: 0 0 0 2px rgba(194, 106, 46, 0.28);
  --am-focus-ring-strong: 0 0 0 3px rgba(194, 106, 46, 0.35);

  --am-bg-0: var(--am-surface-canvas);
  --am-bg-1: var(--am-surface-default);
  --am-border: var(--am-border-default);
  --am-text-1: var(--am-text-primary);
  --am-text-2: var(--am-text-secondary);

  --am-table-head-bg: var(--am-surface-muted);
  --am-table-head-text: #334155;
  --am-table-row-border: var(--am-border-default);
  --am-table-row-hover: #f8fafc;
  --am-table-row-bg: #ffffff;
}
```

## 4. Typography Scale (Tailwind-Like)

### 4.1 Font families and weights
| Token | Value | Usage |
|---|---|---|
| `--am-font-sans` | `'Inter', system-ui, -apple-system, sans-serif` | Primary UI text |
| `--am-font-mono` | `'JetBrains Mono', monospace` | Hashes, IDs, build tags |
| `--am-font-weight-medium` | `500` | Interactive labels |
| `--am-font-weight-semibold` | `600` | Headings, emphasized text |
| `--am-font-weight-bold` | `700` | Status pills, strong emphasis |

### 4.2 Size aliases
| Alias | Token | Size | Typical usage |
|---|---|---|---|
| `text-2xs` | `--am-font-size-2xs` | `0.65rem` (10.4px) | dense badges/table headers |
| `text-xs` | `--am-font-size-xs` | `0.75rem` (12px) | labels, helper text |
| `text-sm` | `--am-font-size-sm` | `0.875rem` (14px) | default body, inputs, buttons |
| `text-base` | `--am-font-size-base` | `1rem` (16px) | primary content |
| `text-lg` | `--am-font-size-lg` | `1.125rem` (18px) | card titles |
| `text-xl` | `--am-font-size-xl` | `1.25rem` (20px) | key numbers |
| `text-2xl` | `--am-font-size-2xl` | `1.5rem` (24px) | section titles |
| `text-3xl` | `--am-font-size-3xl` | `1.75rem` (28px) | page titles |

Recommended CSS definitions:
```css
:root {
  --am-font-size-2xs: 0.65rem;
  --am-font-size-xs: 0.75rem;
  --am-font-size-sm: 0.875rem;
  --am-font-size-base: 1rem;
  --am-font-size-lg: 1.125rem;
  --am-font-size-xl: 1.25rem;
  --am-font-size-2xl: 1.5rem;
  --am-font-size-3xl: 1.75rem;
}
```

Recommended line-height tokens:
- `--am-line-height-tight: 1.2`
- `--am-line-height-snug: 1.35`
- `--am-line-height-normal: 1.5`

## 5. Spacing Scale (Semantic Axis Tokens)

Use semantic spacing tokens by axis and intent instead of numeric aliases.

### 5.1 Base spacing sizes
| Size | Token | Value |
|---|---|---|
| `2xs` | `--am-spacing-size-2xs` | `0.125rem` (2px) |
| `xs` | `--am-spacing-size-xs` | `0.25rem` (4px) |
| `s` | `--am-spacing-size-s` | `0.5rem` (8px) |
| `m` | `--am-spacing-size-m` | `0.75rem` (12px) |
| `l` | `--am-spacing-size-l` | `1rem` (16px) |
| `xl` | `--am-spacing-size-xl` | `1.5rem` (24px) |
| `2xl` | `--am-spacing-size-2xl` | `2rem` (32px) |
| `3xl` | `--am-spacing-size-3xl` | `2.5rem` (40px) |

### 5.2 Axis-based semantic tokens
| Intent | Example token | Typical usage |
|---|---|---|
| Inline gap (left/right flow) | `--am-spacing-inline-s` | button icon gaps, horizontal toolbars |
| Stack gap (top/bottom flow) | `--am-spacing-stack-m` | vertical form fields, card sections |
| Inset/padding | `--am-spacing-inset-l` | card/input/button padding |
| Squish inset (tight vertical, roomy horizontal) | `--am-spacing-inset-squish-s` | compact pills and small controls |
| Stretch inset (roomy vertical, tight horizontal) | `--am-spacing-inset-stretch-s` | stacked chips or tags |

Recommended CSS definitions:
```css
:root {
  --am-spacing-size-2xs: 0.125rem;
  --am-spacing-size-xs: 0.25rem;
  --am-spacing-size-s: 0.5rem;
  --am-spacing-size-m: 0.75rem;
  --am-spacing-size-l: 1rem;
  --am-spacing-size-xl: 1.5rem;
  --am-spacing-size-2xl: 2rem;
  --am-spacing-size-3xl: 2.5rem;

  --am-spacing-inline-2xs: var(--am-spacing-size-2xs);
  --am-spacing-inline-xs: var(--am-spacing-size-xs);
  --am-spacing-inline-s: var(--am-spacing-size-s);
  --am-spacing-inline-m: var(--am-spacing-size-m);
  --am-spacing-inline-l: var(--am-spacing-size-l);
  --am-spacing-inline-xl: var(--am-spacing-size-xl);

  --am-spacing-stack-2xs: var(--am-spacing-size-2xs);
  --am-spacing-stack-xs: var(--am-spacing-size-xs);
  --am-spacing-stack-s: var(--am-spacing-size-s);
  --am-spacing-stack-m: var(--am-spacing-size-m);
  --am-spacing-stack-l: var(--am-spacing-size-l);
  --am-spacing-stack-xl: var(--am-spacing-size-xl);
  --am-spacing-stack-2xl: var(--am-spacing-size-2xl);

  --am-spacing-inset-xs: var(--am-spacing-size-xs);
  --am-spacing-inset-s: var(--am-spacing-size-s);
  --am-spacing-inset-m: var(--am-spacing-size-m);
  --am-spacing-inset-l: var(--am-spacing-size-l);
  --am-spacing-inset-xl: var(--am-spacing-size-xl);

  --am-spacing-inset-squish-s: var(--am-spacing-size-xs) var(--am-spacing-size-s);
  --am-spacing-inset-squish-m: var(--am-spacing-size-s) var(--am-spacing-size-m);
  --am-spacing-inset-stretch-s: var(--am-spacing-size-m) var(--am-spacing-size-xs);
  --am-spacing-inset-stretch-m: var(--am-spacing-size-l) var(--am-spacing-size-s);
}
```

## 6. Shape, Shadow, Motion

### 6.1 Radius
| Token | Value | Usage |
|---|---|---|
| `--am-radius-sm` | `4px` | inputs, compact buttons |
| `--am-radius-md` | `6px` | cards, standard buttons |
| `--am-radius-lg` | `10px` | menus, segmented controls |
| `--am-radius-xl` | `14px` | modal shells, feature cards |
| `--am-radius-full` | `999px` | pills/badges |

### 6.2 Shadow
| Token | Dark value | Light value | Usage |
|---|---|---|---|
| `--am-shadow-sm` | `0 4px 6px -1px rgba(0,0,0,0.4)` | `0 4px 10px -4px rgba(15,23,42,0.15)` | dropdowns |
| `--am-shadow-md` | `0 12px 24px -20px rgba(0,0,0,0.8)` | `0 12px 24px -18px rgba(15,23,42,0.2)` | hover cards |
| `--am-shadow-lg` | `0 24px 48px -28px rgba(0,0,0,0.8)` | `0 22px 44px -26px rgba(15,23,42,0.25)` | modal/dialog |

### 6.3 Motion
| Token | Value |
|---|---|
| `--am-ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--am-ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--am-dur-1` | `120ms` |
| `--am-dur-2` | `180ms` |
| `--am-dur-3` | `240ms` |
| `--am-dur-4` | `320ms` |

## 7. Component State Tokens

### 7.1 Buttons
Define token contracts per variant so every state is explicit.

```css
:root {
  /* Shared */
  --am-btn-ring: var(--am-focus-ring);
  --am-btn-disabled-opacity: 0.55;

  /* Primary */
  --am-btn-primary-bg: var(--am-color-brand-500);
  --am-btn-primary-bg-hover: var(--am-color-brand-600);
  --am-btn-primary-bg-active: var(--am-color-brand-700);
  --am-btn-primary-text: #ffffff;
  --am-btn-primary-border: transparent;

  /* Secondary */
  --am-btn-secondary-bg: transparent;
  --am-btn-secondary-bg-hover: var(--am-overlay-hover);
  --am-btn-secondary-bg-active: var(--am-overlay-active);
  --am-btn-secondary-text: var(--am-text-primary);
  --am-btn-secondary-border: var(--am-border-default);
  --am-btn-secondary-border-hover: var(--am-border-strong);

  /* Destructive */
  --am-btn-danger-bg: var(--am-danger-fg);
  --am-btn-danger-bg-hover: #dc2626;
  --am-btn-danger-bg-active: #b91c1c;
  --am-btn-danger-text: #ffffff;
  --am-btn-danger-border: transparent;

  /* Ghost / text */
  --am-btn-ghost-bg: transparent;
  --am-btn-ghost-bg-hover: var(--am-overlay-hover);
  --am-btn-ghost-bg-active: var(--am-overlay-active);
  --am-btn-ghost-text: var(--am-text-secondary);
  --am-btn-ghost-text-hover: var(--am-text-primary);
}
```

State coverage checklist for each button variant:
- `default`
- `hover`
- `active` (mouse down / pressed)
- `focus-visible`
- `disabled`

### 7.2 Inputs
```css
:root {
  --am-input-bg: var(--am-surface-default);
  --am-input-text: var(--am-text-primary);
  --am-input-placeholder: var(--am-text-secondary);
  --am-input-border: var(--am-border-default);
  --am-input-border-hover: var(--am-border-strong);
  --am-input-border-focus: var(--am-color-brand-500);
  --am-input-ring-focus: var(--am-focus-ring);
  --am-input-bg-disabled: var(--am-overlay-disabled);
}
```

### 7.3 Table
```css
:root {
  --am-table-header-bg: var(--am-surface-muted);
  --am-table-header-text: var(--am-text-secondary);
  --am-table-row-bg: transparent;
  --am-table-row-bg-hover: var(--am-overlay-hover);
  --am-table-row-border: var(--am-border-muted);
}
```

### 7.4 Status Pills / Badges
```css
:root {
  --am-pill-success-fg: var(--am-success-fg);
  --am-pill-success-bg: var(--am-success-bg);
  --am-pill-success-border: var(--am-success-border);

  --am-pill-warning-fg: var(--am-warning-fg);
  --am-pill-warning-bg: var(--am-warning-bg);
  --am-pill-warning-border: var(--am-warning-border);

  --am-pill-danger-fg: var(--am-danger-fg);
  --am-pill-danger-bg: var(--am-danger-bg);
  --am-pill-danger-border: var(--am-danger-border);

  --am-pill-info-fg: var(--am-info-fg);
  --am-pill-info-bg: var(--am-info-bg);
  --am-pill-info-border: var(--am-info-border);
}
```

## 8. Recommended Utility Mapping
To make adoption simple, expose optional utility classes:

- Typography: `.am-text-2xs`, `.am-text-xs`, `.am-text-sm`, `.am-text-base`, `.am-text-lg`, `.am-text-xl`, `.am-text-2xl`, `.am-text-3xl`
- Spacing: `.am-gap-inline-s`, `.am-gap-stack-m`, `.am-pad-inset-l`, `.am-pad-inset-squish-s`, `.am-mt-stack-m`, etc. mapped to `--am-spacing-*`

This keeps typography familiar while giving spacing clearer intent-based naming for design/system collaboration.

## 9. Migration Priority
1. Replace hardcoded status colors (`#22c55e`, `#ef4444`, `#f59e0b`, `#38bdf8`) with semantic tokens.
2. Move button styles (`primary`, `secondary`, `icon`, `filter pills`) to explicit state tokens.
3. Normalize radius to `sm/md/lg/xl/full` and spacing to semantic axis tokens (`spacing-inline-*`, `spacing-stack-*`, `spacing-inset-*`).
4. Remove legacy `--color-*` and `.btn-*` remnants after all references are migrated.

## 10. Guardrails
- New UI styles should use semantic/component tokens, not raw hex values.
- Any interactive component must define all required states: `default/hover/active/focus-visible/disabled`.
- Light/dark differences belong in theme token overrides, not inside component-level conditional colors.
- Keep backward compatibility aliases until migration is complete, then remove them in a dedicated cleanup change.

## 11. Current Implementation Map
- Token variable source file: `src/theme/tokens.css`
- Global import order: `src/index.css` imports `src/theme/tokens.css` first
- UI primitive layer: `src/components/ui` (`Button`, `Input`, `Textarea`)
- UI primitive styles: `src/components/ui/ui.css` (token-driven variant/state styles)
- Migration status: primary app buttons and text-entry inputs are routed through the UI layer; native inputs remain only for checkbox/file use cases.
