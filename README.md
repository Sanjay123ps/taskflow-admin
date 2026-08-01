# TaskFlow — Admin Portal (Frontend)

Production-grade admin frontend for the Task Manager platform. This is **Phase 1**:
a complete, fully-typed frontend wired to a REST API contract. No mock data is
baked in anywhere — every screen calls a real endpoint and renders proper
loading / empty / error states. Until the backend (Phase 2) exists, pages will
show their error/empty states, which is expected.

## Stack

- **React 19 + TypeScript + Vite** — app shell and build tooling
- **Tailwind CSS v4** — design tokens defined in `src/index.css` (`@theme`)
- **React Router v7** — client-side routing, protected routes
- **TanStack Query** — server state, caching, and invalidation
- **Axios** — API client with access/refresh-token handling baked in
- **React Hook Form + Zod** — all forms and validation
- **Radix UI primitives** — accessible Dialog, Sheet, Select, Dropdown, Tabs, etc.
  (hand-styled to match the design system, not a copy-pasted component library)
- **Recharts** — task analytics chart on the dashboard
- **Sonner** — toast notifications

## Getting started

```bash
npm install
cp .env.example .env      # point VITE_API_URL at your backend once it exists
npm run dev                # http://localhost:5173
```

```bash
npm run build   # type-checks with tsc -b, then builds to dist/
npm run lint    # oxlint
```

## Project structure

```
src/
  api/            One file per endpoint group (auth, staff, tasks, dashboard,
                   activity, signupRequests, reports, settings) + the shared
                   axios client with refresh-token + error normalization.
  hooks/           TanStack Query hooks per module. Mutations invalidate the
                   dashboard + related lists automatically (e.g. completing a
                   task refreshes Dashboard, Pending Tasks, and Staff stats).
  context/         AuthContext (admin session, login/logout).
  types/           TypeScript types mirroring the backend's data model.
  components/
    ui/            Hand-built shadcn-style primitives on Radix.
    layout/        Sidebar, Header, GlobalSearch, NotificationsMenu, AdminLayout.
    dashboard/      KPI cards, staff progress ring cards, staff detail modal,
                    recent activity feed, analytics chart.
    staff/ tasks/ settings/   Feature-specific forms and dialogs.
    common/         Shared building blocks: EmptyState, ErrorState, Pagination,
                    ConfirmDialog, ProtectedRoute, SearchInput, StatusBadge…
  pages/            One file per route (see routing below).
```

## Routes

| Path              | Page              | Notes                                   |
|-------------------|-------------------|------------------------------------------|
| `/login`          | Login             | Public                                    |
| `/`               | Dashboard         | KPIs, staff progress, activity, analytics |
| `/staff`          | Staff Management  | List, add/edit, deactivate, reset password|
| `/tasks/new`      | New Task          | Assign a task to a staff member           |
| `/tasks/pending`  | Pending Tasks     | Pending / In Progress / Overdue           |
| `/tasks/completed`| Completed Tasks   | Completed, with time-to-complete          |
| `/activity`       | Activity Log      | Full audit trail with filters             |
| `/export`         | Data Export       | Task / Staff / Activity reports           |
| `/settings`       | Settings          | General, Task, Security, Account tabs     |

All routes except `/login` are behind `ProtectedRoute`, which checks the
access token, fetches `/auth/me`, and redirects to `/login` if unauthenticated.
Pages are code-split with `React.lazy`.

## API contract this frontend expects (for Phase 2)

Every response is expected in the shape:

```ts
{ success: true, data: T, message?: string }
// or
{ success: false, message: string, errors?: Array<{ field?: string; message: string }> }
```

Auth uses a short-lived **access token** (returned from `/auth/login`, stored
in `localStorage`, sent as `Authorization: Bearer`) plus a **refresh token**
in an httpOnly cookie (`/auth/refresh`). A single silent-refresh-and-retry is
implemented in `src/api/client.ts` for any `401`.

See `src/types/` for the exact shapes expected (`User`, `Task`, `ActivityLogEntry`,
`SignupRequest`, `DashboardSummary`, settings types) and `src/api/*.ts` for the
exact endpoints and params each screen calls — that's the contract the backend
needs to satisfy. Nothing in the type layer or API layer needs to change when
the backend is added; only `VITE_API_URL` does.

## Notes / things worth knowing

- **File uploads** (task attachments) are sent as `multipart/form-data`.
- **Reports** (`/export`, and the Export buttons on Pending/Completed Tasks and
  Activity Log) call `GET /reports/:type` with `responseType: 'blob'` and
  trigger a browser download client-side.
- **Global search** and **notifications** in the header are real, not decorative:
  search queries `/staff` and `/tasks` live; notifications are derived from
  pending signup requests + overdue task counts.
- `npm audit` flags a high-severity advisory in `react-router` that only
  applies to RSC/framework mode. This app uses plain `BrowserRouter` (client
  SPA), so it isn't exposed — worth re-checking before upgrading in Phase 2.
- Tailwind v4 is configured via `@theme` in `src/index.css` (no `tailwind.config.ts`
  needed) — that's where the whole color/type/radius system lives.

## Next up (Phase 2)

Build the backend (Express/Fastify + PostgreSQL per the original spec) to
satisfy the contract above, then swap `VITE_API_URL` and everything should
light up — no frontend changes expected beyond fixing any contract drift.
