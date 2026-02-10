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

#### Build Commit Hash
The build number shown in the UI is always accurate to the current Git commit. This is injected automatically at build time using Vite:

- The current commit hash is available as `import.meta.env.VITE_GIT_COMMIT` in the app.
- The `BuildTag` component displays this value in the UI.

No manual steps are required; this is handled by the Vite config.

### Testing

```bash
npm test
```

```bash
npm run test:ci
```

```bash
npm run test:api
```

## Features
- **Dashboard**: Overview of agent activity.
- **Contacts**: Manage user contacts.
- **Phone/SMS**: Interactive demos for phone and text agents.
- **Data Sources**: Manage knowledge base files.
