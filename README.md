# CRM Prototype — Client

A full-featured Customer Relationship Management (CRM) web application built for B2B sales workflows. This is the frontend client, built with React 19 and a modern toolchain.

---

## Overview

This application manages the complete B2B prospecting and sales pipeline — from initial lead capture and call logging, through pipeline opportunity tracking, to final prospectus management. It supports multi-role organizations (employee, admin, super admin) with route-level and UI-level access control throughout.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 19 + Vite 7 |
| Routing | React Router v7 |
| Server State | TanStack Query v5 |
| Client State | Zustand v5 |
| Forms | React Hook Form v7 + Zod v4 |
| Styling | Tailwind CSS v4 + Radix UI (shadcn/ui) |
| HTTP Client | Axios with JWT interceptors |
| Drag & Drop | React DnD (HTML5 backend) + dnd-kit |
| Charts | Recharts |
| Internationalization | react-i18next (English + Arabic / RTL) |
| Theming | next-themes (light / dark) |
| Notifications | Sonner |
| API Mocking | MSW v2 |
| Code Quality | ESLint + Prettier |

---

## Features

### Authentication & Authorization
- Multi-step signup flow with organization registration
- JWT-based authentication with silent token refresh via Axios response interceptors
- Role-based route guards supporting three roles: `employee`, `admin`, `super_admin`
- Team invite acceptance flow via tokenized invite links
- Session expiry handling with automatic logout on invalid/expired tokens

### Dashboard
- Interactive area charts built with Recharts
- Role-specific dashboard views (employee / admin / super admin)

### Leads
- Full CRUD: create, list, detail view, edit
- Tabular list with filtering and pagination
- Structured company + contact data model

### Call Logs
- Full CRUD: create, list, detail view, edit
- Linked to leads/contacts for activity tracking

### Pipeline (Kanban Board)
- Drag-and-drop Kanban board with 6 stages using React DnD
- Opportunity creation, editing, detail view, and deletion
- Stage transitions via drag with server sync
- Proposal file upload support
- Role-gated delete actions

### Prospectus Management
- Full CRUD: create, list, detail view, edit
- Company + multiple contacts nested data model
- **Bulk CSV Upload** — full 3-step wizard:
  - Step 1: Download pre-filled template, drag-and-drop file upload (10 MB limit)
  - Step 2: Two-stage validation (client-side field checks + server pre-validation round-trip) with row-level error reporting and downloadable error reports (UTF-8 BOM encoded for Excel compatibility)
  - Step 3: Preview summary and confirm submission with TanStack Query cache invalidation on success
  - Handles 7 date formats including Excel serial numbers and 2-digit years
  - Flat CSV rows transformed client-side into nested company → contacts payload via composite-key deduplication

### Archived Data
- Restore or permanently manage archived records
- Restricted to `super_admin` role only

### Internationalization
- Full English and Arabic language support
- RTL layout switching via `tailwindcss-rtl`
- Language toggle available in the app header

---

## Project Structure

```
src/
├── components/
│   ├── common/          # Shared layout components (PageHeader, SectionCard, etc.)
│   ├── form-fields/     # Reusable form primitives (PhoneInputGroup, AddressFields, etc.)
│   ├── forms/           # Domain-specific forms (leads, prospectus, pipeline, call logs)
│   ├── pipeline/        # Kanban board components (Board, Column, Card)
│   └── ui/              # shadcn/ui base components (Button, Dialog, Table, etc.)
├── hooks/               # Custom React hooks
├── i18n/                # Translation JSON files (en.json, ar.json)
├── layouts/             # PublicLayout / PrivateLayout wrappers
├── pages/               # Route-level page components grouped by domain
├── routes/              # Centralized route definitions with role guards
├── service/             # API service functions (one file per domain)
├── store/               # Zustand stores (auth, user)
└── utils/
    ├── axios/           # Axios instances and interceptors
    ├── bulkUploadTransformer.js   # CSV → backend payload ETL + validation
    ├── csvParser.js               # RFC 4180 CSV parser (no dependencies)
    └── prospectusTemplateGenerator.js  # Programmatic CSV template generator
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm start
```

Runs the Vite dev server. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

Outputs production-ready assets to `dist/`.

### Preview Production Build

```bash
npm run preview
```

### Lint & Format

```bash
npm run lint          # ESLint
npm run format        # Prettier (write)
npm run format:check  # Prettier (check only)
```

---

## Architecture Notes

**Server state** is managed entirely through TanStack Query. All API calls go through service functions in `src/service/`, called from query/mutation hooks. Cache is invalidated surgically after mutations (e.g., `queryClient.invalidateQueries(["prospectuses"])`) to keep the UI consistent without full-page reloads.

**Client state** (auth session, user profile) is held in Zustand stores persisted to `sessionStorage`/`localStorage`.

**Axios interceptors** handle the full JWT lifecycle: attaching the `Authorization` header on every private request, silently refreshing expired access tokens (error code `2003`), and forcing logout on revoked/invalid sessions (error codes `2001`, `2006`).

**Forms** use React Hook Form with Zod schemas for validation. All form field components are composable primitives that accept RHF `control` props directly.

**API mocking** is set up with MSW v2 for development and testing without a live backend.
