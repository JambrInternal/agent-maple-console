# Visual Styling Principles

These principles define the **Industrial** aesthetic of Agent Maple. The UI should feel like a reliable, high-quality tool found on a construction site—practical, calm, and trustworthy.

---

## 1. Industrial Dimensionality
Professional tools use depth to separate complexity from daily utility.

-   **Deep Context**: Use a Background color (`--am-bg-0`, Deep Navy) to provide a stable, low-strain foundation.
-   **Surfaces of Action**: Use Surface colors (`--am-bg-1`, Navy) for cards and sidebars to indicate where work happens.
-   **Machined Borders**: Use subtle borders (`1px solid --am-border`) to create clear, geometric separation between functional zones.
-   **Glassmorphism (Measured)**: Use `backdrop-filter: blur()` on overlays like modals or dropdowns to preserve context while indicating a new layer.

## 2. Practical Color System
Avoid "hype" or "next-gen" aesthetics. Every color is functional.

-   **Industrial Foundation**: Use Deep Navy and Steel Blue as the base. These are "calm" colors that don't distract a busy user.
-   **Functional Accents**: Use the brand Burnt Orange (`#C26A2E`) for primary actions (e.g., "Connect Data Source").
-   **Status Transparency**: Use Emerald for success, Amber for warnings, and Rose for errors. Always pair with icons for accessibility.

## 3. Geometric Precision
Consistency in shapes creates a sense of engineering quality.

-   **The 8px Grid**: All spacing, margins, and padding should be multiples of 8 (or 4 for tight elements). This ensures visual mathematical harmony.
-   **Subtle Border Radii**: Use `6px` to `8px` for standard elements (buttons, inputs). Avoid overly rounded "pill" shapes unless used for badges.
-   **Stroke Weights**: Use `1px` or `1.5px` borders. Avoid `2px+` borders unless they are part of a deliberate "bold" brand identity.

## 4. Typography: The Site as a Tool
In the console, copy is the UI. Respect the busy trades owner.

- **Short & Direct**: Use Inter at a readable scale. Avoid long paragraphs.
- **Outcome-First**: Headings should clearly state the benefit (e.g., "Recover Missed Leads" instead of "Call History").
- **Mono Precision**: Use JetBrains Mono for technical data points (IDs, Log timestamps, p75 metrics) to signal engineering accuracy.

## 5. Micro-Interactions
Professionalism is felt in the transitions.

-   **Tactile Feedback**: Buttons should have a subtle transform (`scale(0.98)`) on click and a smooth background transition on hover (`200ms ease-in-out`).
-   **Content Mounting**: Use a subtle "slide-up + fade-in" (TranslateY: 10px -> 0px) for new page content or modal appearances.
-   **Meaningful Motion**: Motion should only exist to explain where something came from or where it's going (e.g., sidebar sliding in).
