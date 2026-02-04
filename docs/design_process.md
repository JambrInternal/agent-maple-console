# Professional Design & Development Process

This process follows industry standards used by top-tier product teams to ensure applications are both functional and visually stunning.

---

## Phase 1: Context & Discovery
*Goal: Understand the "Why" and "Who"*

1.  **Requirement Gathering**: Define the core problem. What is the single most important task the user needs to complete?
2.  **User Personas & Stories**: Map out who is using the tool (e.g., an "Agent Developer" vs. a "Business Manager").
3.  **Audit & Inspiration**: Look at benchmarks (like VS Code or Stripe) to see how others solved similar information density or onboarding problems.

## Phase 2: Information Architecture (IA)
*Goal: Map the "Skeleton"*

1.  **Sitemap**: Define the page nesting and navigation paths.
2.  **Wireframing (Low-Fidelity)**: Create "grey-box" layouts in tools like Figma or Excalidraw. Focus on **placement** and **flow**, not colors or fonts.
3.  **User Flow Testing**: Walk through the wireframes. Does it take too many clicks to get to the "Data Sources"?

## Phase 3: High-Fidelity Design (Visuals)
*Goal: Create the "Muscle and Skin"*

1.  **Design System Foundation**: Define your "Tokens" (Colors, Typography, Spacing).
2.  **Component Library**: Design individual atoms: Buttons, Inputs, Cards, Modals.
3.  **Full Page Mockups**: Assemble the components into finished page designs.
4.  **Interactive Prototyping**: Connect pages in Figma to test transitions and "feel."

## Phase 4: Implementation (Handoff)
*Goal: Bring the design to life*

1.  **Design Tokens Sync**: Export colors and spacing as CSS variables or Tailwind config.
2.  **Atomic Development**: Build components in isolation (using Storybook or similar) before placing them in the app.
3.  **Visual QA**: Review the built app against the mockups. Check margins, font weights, and hover states.

## Phase 5: Feedback & Iteration
*Goal: Refine and Polish*

1.  **Usability Testing**: Watch a user try to use the new feature without help.
2.  **Telemetry Analysis**: Use tools (like PostHog or Microsoft Clarity) to see where users get stuck.
3.  **Continuous Polish**: Design is never "done." Iterate based on real-world usage.

---

> [!TIP]
> **The "Design-to-Code" Bridge**
> Always maintain a 1:1 relationship between your design system in Figma and your component library in React. If you change a button's primary color in Figma, it should be a single variable change in your code.
