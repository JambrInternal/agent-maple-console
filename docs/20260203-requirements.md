# App Requirements: Agent Maple Console

## 1. Product Overview
**Product Name:** Agent Maple Console
**Platform:** Web Application (React + Vite)
**Goal:** A centralized management dashboard for users to configure, monitor, and interact with their "Agent Maple" AI workforce.

## 2. Functional Requirements

### 2.1. App Shell & Navigation
*   **Persistent Layout:** A fixed sidebar navigation with a scrollable main content area.
*   **Collapsible Sidebar:**
    *   Must toggle between "Expanded" (Wordmark Logo + Labels) and "Collapsed" (Icon Logo only).
    *   **Auto-Collapse:** Sidebar must automatically collapse on viewports narrower than `1024px` to preserve content space.
*   **Branding:**
    *   **Expanded:** "Agent Maple" Wordmark (White text on Navy).
    *   **Collapsed:** "Maple Leaf" Icon (White on Navy).
*   **Navigation State:**
    *   Active items must use the **"Minimalist Industrial"** style: Transparent background, Bold Navy text, Burnt Orange dot indicator.

### 2.2. Core Modules
*   **Contacts**:
    *   Display a list of users/contacts associated with the agent.
    *   Action to "Invite User".
    *   Data points: Name, Email, Phone, Created Date, Last Updated.
*   **Agent Communication**:
    *   **Phone Page**: Display the Agent's phone number, session ID, and calling instructions.
    *   **SMS Page**: Display text messaging instructions and number.
    *   **Future Modules**: Email, Calendar, Threads, Issues (Placeholders required).
*   **Knowledge Base**:
    *   **Data Sources**: List uploaded documents (PDFs, etc.) that the agent uses for context.
    *   Metadata: File Name, Size, Type, Upload Source, Date.
    *   Actions: "Upload File" and "Sync Google Drive".
*   **Analytics**:
    *   **Future Modules**: Knowledge Graph, Insights (Placeholders required).

## 3. Non-Functional Requirements (UX/UI)

### 3.1. Aesthetic & Design System
*   **Theme**: "Industrial Precision" – Clean, data-dense, professional.
*   **Color Palette**:
    *   **Primary**: Burnt Orange (`#C26A2E`) for actions and highlights.
    *   **Secondary**: Navy Blue (`#001F3F`) for headers and navigation.
    *   **Background**: Off-white (`#F9FAFB`) with a subtle **Grid Pattern** overlay.
*   **Typography**: `Inter` (Sans-serif) for legibility.
*   **Styling Specs**:
    *   Global Border Radius: **4px** (Sharp/Technical look).
    *   Animations: Smooth transitions for sidebar toggle (`width`) and page loads (`fade-in`).

### 3.2. Technical Constraints
*   **Client-Side Path**: pure frontend implementation (no backend required for MVP).
*   **Responsiveness**:
    *   Must function on Desktop, Tablet, and Mobile.
    *   Mobile View (< 640px): Content padding adjusts to prevent overflow.

## 4. Technical Stack
*   **Framework**: React 19
*   **Build System**: Vite
*   **Environment**: Node.js v24 (managed via `mise`)
*   **Styling**: Vanilla CSS (Variables + Utility Classes)
