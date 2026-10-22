# IncidentSphere — Frontend Single-Page Application

Modern, responsive enterprise dashboard built with React 18 and Vite.

## Features
- **Role-Based Views**: Tailored experiences for Admin, Support, and Developer roles.
- **Operations Dashboard**: Real-time KPI summary, status/priority breakdown charts, and recent incident logs.
- **Incident Central**: Full-text keyword search, multi-field filters (Status, Priority, Severity), and paginated data grid.
- **Incident Lifecycle Detail View**: Status transition action bar enforcing the finite state machine, technical discussion thread, and chronological audit history.
- **User Management & RBAC**: Admin interface to activate/disable accounts and assign roles.

## Quick Start

### Prerequisites
- Node.js 20+
- npm 10+

### Development Server
```bash
npm install
npm run dev
```

App will run at `http://localhost:5173`.

### Production Build
```bash
npm run build
```
Compiled assets will be output to `frontend/dist/`.
