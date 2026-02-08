# Agent Maple Console

The official management console for **Agent Maple**.

## Project Setup

This project is built with **Vite + React**.

### Prerequisites
- Node.js v20.19+ (Managed via `mise` is recommended)

### Tooling (mise)
This repo ships a `.tool-versions` file. If you use `mise`, run:

```bash
mise install
```

### Development

```bash
npm install
npm run dev
```

### Environment

Set the API base URL at build time:

```bash
VITE_API_URL=https://api.stage.certly.jambr.ca
```

### Build

```bash
npm run build
```

### Testing

```bash
npm test
```

```bash
npm run test:ci
```

## Features
- **Dashboard**: Overview of agent activity.
- **Contacts**: Manage user contacts.
- **Phone/SMS**: Interactive demos for phone and text agents.
- **Data Sources**: Manage knowledge base files.
