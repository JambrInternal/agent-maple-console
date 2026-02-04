# Visual Audit: Agent Maple Console Mockups

After analyzing the high-fidelity mockups against the provided inspiration images, I have identified several opportunities for refinement to achieve the **"WOW"** factor and premium technical aesthetic required.

## 1. Information Density & Spacing
> [!IMPORTANT]
> **Observation**: The current mockups feel slightly too "spacious" (consumer-app style) compared to the high-density technical feel of Supabase or VS Code.
*   **Problem**: Card padding (24px) and table cell padding (16px) create too much vertical scrolling.
*   **Fix**: Reduce standard card padding to `16px` and table row padding to `12px`. Use a tighter vertical scale for metrics.

## 2. Shell & Sidebar Alignment
*   **Problem**: The sidebar "Logo Mark" and "Header Breadcrumbs" are not perfectly aligned on the same horizontal baseline in some views.
*   **Fix**: Standardize the sidebar logo container to exactly match the header height (`48px`) to create a continuous horizontal line across the top.

## 3. Aesthetic Polish (The "Industrial" Look)
*   **Problem**: The breadcrumb "Active" state is a bit too loud (orange background).
*   **Fix**: Transition the active breadcrumb to a "High Contrast White" with no background, using a subtle bottom-border or simply a weight change.
*   **Problem**: Hover effects (shadows/transforms) are a predictable consumer-web pattern.
*   **Fix**: Use **Inset Borders** or color shifts for hover states instead of heavy shadows to maintain the "Industrial" feel.

## 4. Typography Hierarchy
*   **Problem**: Technical metrics (Token counts, Latency, Concurrency) are using Inter, making them hard to scan as data.
*   **Fix**: Force **JetBrains Mono** for all numerical and status-based data to lean into the "Developer Console" aesthetic.

## 5. UI Contrast
*   **Problem**: The `am-bg-1` (Surface) and `am-bg-0` (Base) contrast is too low in some lightning conditions.
*   **Fix**: Slightly darken `am-bg-0` to `#02040a` and brighten borders to `#334155` for sharper definition of the "Steel" boundaries.

---

### Comparison Matrix

| Element | Current | Proposed (Industrial) |
| :--- | :--- | :--- |
| **Card Padding** | 24px | 16px |
| **Table Spacing** | Loose | High-Density |
| **Data Font** | Inter | JetBrains Mono |
| **Hover State** | Shadow + Lift | Border + Background Shift |
| **Active Breadcrumb** | Orange Pill | High-Contrast White |
