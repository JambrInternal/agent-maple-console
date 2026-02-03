# Planning History & Decisions

## Phase 1: Inception & Setup
- **Objective**: Build a premium agent management console (**Agent Maple**).
- **Decision**: Use **React + Vite** for speed and modern tooling.
- **Environment**: Implemented `mise` for reproducible Node.js version management.

## Phase 2: Core Implementation
- **Routing**: Established `react-router-dom` for easy navigation between Contacts, Phone, SMS, etc.
- **Data Mocking**: Implemented static arrays in components to simulate backend data for the MVP.
- **Feature Set**:
  - **Contacts**: Table view with "Invite" action.
  - **Phone/SMS**: Instruction cards with session IDs.
  - **Data Sources**: File list with metadata.

## Phase 3: Branding & Polish
- **Branding**: Implemented official **Agent Maple** assets.
  - Fetched official assets from `agentmaple.ca`.
  - Updated color scheme to Navy/Orange.
- **Sidebar**: Implemented a **Collapsible Sidebar**.
  - **Decision**: Show full wordmark when expanded, white icon when collapsed.
  - **Mobile**: Auto-collapse sidebar on screens < 1024px.
- **Nav Style**: Selected **"Minimalist Industrial"** (Option C) over "High Contrast" or "Highlight" styles for a cleaner look.
- **Refinement**: Tightened border radius to **4px** for a sharper, more technical feel.

## Future Roadmap (Planned)
- [ ] Connect to real Backend API (Node/Python).
- [ ] Implement robust Dashboard Analytics.
- [ ] Add Authentication (Login/Auth0).
- [ ] Enable file uploads in Data Sources.
