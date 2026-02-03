# Architecture & Implementation

## Technology Stack
- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router 7 (`react-router-dom`)
- **Language**: JavaScript (ES Modules)
- **Styling**: Vanilla CSS (Global variables, utility + component classes)
- **Icons**: `lucide-react`
- **Package Manager**: `npm` (Node v24 via `mise`)

## Project Structure
```
src/
├── assets/         # Static assets (logos, icons)
├── components/     # Reusable UI components
│   ├── Layout.jsx  # Main App Wrapper (Sidebar + Content)
│   └── Sidebar.jsx # Navigation & Branding logic
├── pages/          # Route components (Contacts, Phone, SMS, etc.)
├── App.jsx         # Router configuration
├── main.jsx        # Entry point
└── index.css       # Global design system & styles
```

## Key Patterns

### 1. App Shell Layout
The application uses a persistent `Layout` component that wraps all page content.
- **Responsiveness**: The layout manages the Sidebar's state (`isCollapsed`).
- **Auto-Collapse**: A `useEffect` listener auto-collapses the sidebar on screens narrower than `1024px`.
- **Mobile Support**: Media queries in `index.css` adjust padding and Sidebar widths for `< 640px` viewports.

### 2. Styling Strategy
We utilize a **CSS Variable System** (`:root` in `index.css`) for consistent theming:
- **Colors**: `--color-primary` (Burnt Orange), `--color-secondary` (Navy Blue).
- **Spacing**: Standardized padding (`1.5rem` headers, `2.5rem` content).
- **Radius**: Global `--radius` (4px) for all cards and buttons.

### 3. Component Design
- **Sidebar**: Handles its own collapsed/expanded rendering logic (switching between Wordmark and Icon logo).
- **Pages**: Built as functional components using common UI patterns (Page Headers, Data Tables, Info Cards).
