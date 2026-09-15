# Civic-Pulse — Smart Civic Issue Resolution & Monitoring System

Civic-Pulse is a full-stack web platform that lets citizens report civic issues
(potholes, garbage, water leakage, broken streetlights and more), routes each
complaint to the right municipal department, and gives officers and
administrators the tools to track, assign, resolve and analyse them end to end.

> **MCA Mini-Project** — School of Computer Science & Engineering, MIT-WPU, Pune
>
> | | |
> |---|---|
> | **Authors** | Suyog Shelke (PRN 1272250562), Soham Shelke (PRN 1272250560) |
> | **Class** | SY MCA, Division C |
> | **Guide** | Dr. Meenal Jabde |
> | **Academic Year** | 2026–2027 |

---

## Table of contents

1. [Highlights](#highlights)
2. [Tech stack](#tech-stack)
3. [Repository structure](#repository-structure)
4. [Prerequisites](#prerequisites)
5. [Quick start — instant frontend demo](#quick-start--instant-frontend-demo)
6. [Full-stack setup — backend + MySQL](#full-stack-setup--backend--mysql)
7. [Demo accounts](#demo-accounts)
8. [Configuration](#configuration)
9. [REST API reference](#rest-api-reference)
10. [Complaint lifecycle](#complaint-lifecycle)
11. [Running in VS Code](#running-in-vs-code)
12. [Troubleshooting](#troubleshooting)
13. [Project scope & disclaimer](#project-scope--disclaimer)

---

## Highlights

**Three role-based portals**, each with its own dashboard, navigation and permissions:

- **Citizen** — register/login, submit a complaint with photos and location,
  track status on a live timeline, view personal statistics, and rate resolved
  complaints.
- **Officer** — see complaints routed to their department, inspect details,
  advance status through the workflow, upload resolution evidence, and adjust
  priority.
- **Administrator** — full oversight: all complaints, assignment to officers,
  department and officer/citizen management, and rich analytics (status,
  category, priority, ward and department breakdowns plus a six-month trend).

**Under the hood**

- Automatic routing of 12 issue categories to 6 civic departments.
- A guarded complaint state machine
  (`SUBMITTED → UNDER_REVIEW → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED`,
  with a `REJECTED` branch) — illegal transitions are rejected server-side.
- Four priority levels (LOW / MEDIUM / HIGH / CRITICAL) with SLA targets.
- JWT-based stateless authentication and method-level role authorisation.
- A complete in-browser **mock backend** that mirrors the REST API field-for-field,
  so the frontend is fully usable **without** the Java server for demos.

---

## Tech stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 6, React Router 6, Bootstrap 5.3, Bootstrap Icons, Recharts, Axios |
| **Backend** | Node.js, Express, MySQL, JWT, bcrypt |
| **Database** | MySQL 8.x |
| **Auth** | JSON Web Tokens (HS256), BCrypt password hashing |
| **Build tools** | npm / Vite (frontend and backend) |

---

## Repository structure

```
civic-pulse/
├── frontend/                 # React + Vite single-page application
│   ├── public/               # favicon and static assets
│   ├── src/
│   │   ├── api/              # API facade + axios client + in-browser mock backend
│   │   ├── auth/            # AuthContext, ProtectedRoute, session handling
│   │   ├── components/       # charts, common UI, complaint widgets, layout
│   │   ├── context/         # ToastContext (notifications)
│   │   ├── hooks/            # useApi, useDebounce, useDocumentTitle
│   │   ├── pages/            # public / citizen / officer / admin pages
│   │   ├── utils/            # constants, formatters, validators, csv export
│   │   ├── App.jsx           # route table
│   │   └── main.jsx          # entry point
│   ├── .env                  # committed demo config (mock API enabled)
│   └── vite.config.js        # dev server + /api proxy to :8080
│
├── backend/                  # Node.js REST API
│   └── src/main/
│       ├── java/com/mitwpu/civicpulse/
│       │   ├── config/       # SecurityConfig, DataSeeder
│       │   ├── controller/   # Auth, User, Department, Complaint, Analytics, File
│       │   ├── domain/       # JPA entities
│       │   ├── dto/          # request/response DTOs
│       │   ├── enums/        # Role, Category, Priority, ComplaintStatus
│       │   ├── exception/    # global error handling
│       │   ├── repository/   # Spring Data JPA repositories
│       │   ├── security/     # JWT filter, service, user details
│       │   └── service/      # business logic
│       └── resources/application.yml
│
├── database/
│   ├── schema.sql            # reference DDL (Hibernate also auto-creates this)
│   └── seed.sql              # reference demo data (app auto-seeds by default)
│
└── README.md
```

---

## Prerequisites

| To run… | You need |
|---|---|
| Frontend (instant demo) | **Node.js 18+** and npm |
| Backend | **Node.js 18+** and npm |
| Database | **MySQL 8.x** running locally |

Check your versions:

```bash
node -v      # v18 or newer
npm -v
node -v         # 18 or newer
npm -v
```

---

## Quick start — instant frontend demo

The fastest way to see the whole application. **No Java, no database required** —
the frontend ships with `VITE_USE_MOCK_API=true`, so every API call is served by
a realistic in-browser mock backed by seeded demo data.

```bash
cd frontend
npm install
npm run dev
```

Then open **http://localhost:5173** and log in with any of the
[demo accounts](#demo-accounts) below (e.g. `admin@civicpulse.in` / `Admin@123`).

That's it — you can submit complaints, move them through the workflow, and view
analytics entirely in the browser.

---

## Full-stack setup — backend + MySQL

Use this when you want the real Node.js API and MySQL persistence.

### 1. Database

Make sure MySQL is running. You don't need to create anything by hand —
the backend connects with `createDatabaseIfNotExist=true` and Hibernate builds
the tables automatically. On first start, `DataSeeder` populates the demo
dataset (6 departments, 10 users, ~46 complaints) as long as the database is
empty.

> Prefer to set the schema up manually? Run `database/schema.sql` then
> `database/seed.sql`, and start the backend with `APP_SEED_DEMO=false`.

### 2. Backend

```bash
cd backend
# Point these at your MySQL instance if they differ from the defaults
#   DB_HOST=localhost DB_PORT=3306 DB_NAME=civicpulse DB_USER=root DB_PASSWORD=root
npm install
npm run dev
```

The API starts on **http://localhost:8080/api**
(health check: `GET http://localhost:8080/api/actuator/health`).

### 3. Frontend against the real API

Edit `frontend/.env` and flip the mock flag off:

```dotenv
VITE_USE_MOCK_API=false
```

Then run the dev server as usual:

```bash
cd frontend
npm install       # first time only
npm run dev
```

Vite proxies all `/api` requests to `http://localhost:8080`, so there are no
CORS issues during development.

---

## Demo accounts

All seeded accounts share simple, memorable passwords. **Change them before any
real deployment.**

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@civicpulse.in` | `Admin@123` |
| Officer — Public Works | `rahul.officer@civicpulse.in` | `Officer@123` |
| Officer — Sanitation | `kavita.officer@civicpulse.in` | `Officer@123` |
| Officer — Water Supply | `amit.officer@civicpulse.in` | `Officer@123` |
| Officer — Drainage | `sunil.officer@civicpulse.in` | `Officer@123` |
| Officer — Electricity | `priya.officer@civicpulse.in` | `Officer@123` |
| Citizen | `suyog@civicpulse.in` | `Citizen@123` |
| Citizen | `soham@civicpulse.in` | `Citizen@123` |
| Citizen | `meera@civicpulse.in` | `Citizen@123` |
| Citizen | `imran@civicpulse.in` | `Citizen@123` |

New citizens can also self-register from the **Register** page.

---

## Configuration

### Frontend (`frontend/.env`)

| Variable | Default | Purpose |
|---|---|---|
| `VITE_USE_MOCK_API` | `true` | `true` = in-browser mock backend; `false` = real Node.js API |
| `VITE_API_BASE_URL` | `/api` | Base path for API calls (proxied to `:8080` in dev) |
| `VITE_MOCK_LATENCY` | `350` | Simulated network delay (ms) for the mock layer |
| `VITE_APP_NAME` | `Civic-Pulse` | Display name used across the UI |

### Backend (`backend/server.js`, overridable via env vars)

| Variable | Default | Purpose |
|---|---|---|
| `DB_HOST` / `DB_PORT` | `localhost` / `3306` | MySQL host and port |
| `DB_NAME` | `civicpulse` | Database name (auto-created) |
| `DB_USER` / `DB_PASSWORD` | `root` / `root` | MySQL credentials |
| `APP_JWT_SECRET` | *(dev default)* | Base64 HMAC key — **override in production** |
| `APP_CORS_ORIGINS` | `http://localhost:5173,http://localhost:4173` | Allowed browser origins |
| `APP_UPLOAD_DIR` | `./uploads` | Where uploaded evidence images are stored |
| `APP_SEED_DEMO` | `true` | Seed demo data on first start when the DB is empty |

---

## REST API reference

All routes are prefixed with the context path **`/api`**
(e.g. login is `POST /api/auth/login`). Protected routes require an
`Authorization: Bearer <token>` header.

| Method | Path | Role | Description |
|---|---|---|---|
| POST | `/auth/register` | public | Register a new citizen |
| POST | `/auth/login` | public | Authenticate, returns JWT + profile |
| GET | `/auth/me` | any | Current user profile |
| PUT | `/users/me` | any | Update own profile |
| PUT | `/users/me/password` | any | Change own password |
| GET | `/users?role=OFFICER` | admin | List users, optionally by role |
| POST | `/users/officers` | admin | Create an officer |
| PUT | `/users/officers/{id}` | admin | Update an officer |
| PATCH | `/users/{id}/active` | admin | Activate / deactivate a user |
| GET | `/departments` | any | List departments (with counts) |
| POST | `/departments` | admin | Create a department |
| PUT | `/departments/{id}` | admin | Update a department |
| GET | `/complaints` | any | List complaints (role-scoped + filters) |
| GET | `/complaints/{id}` | any | Complaint detail with timeline & feedback |
| POST | `/complaints` | citizen | Submit a complaint (multipart, with photos) |
| PATCH | `/complaints/{id}/status` | officer/admin | Advance status (multipart, resolution photos) |
| PATCH | `/complaints/{id}/priority` | officer/admin | Change priority |
| PATCH | `/complaints/{id}/assign` | admin | Assign to an officer |
| POST | `/complaints/{id}/feedback` | citizen | Rate a resolved complaint |
| GET | `/analytics/overview` | admin | System-wide analytics |
| GET | `/analytics/officer` | officer | Officer's own analytics |
| GET | `/analytics/citizen` | citizen | Citizen's own analytics |
| GET | `/files/{filename}` | public | Serve an uploaded image |

---

## Complaint lifecycle

Every status change is recorded on the complaint's timeline with the actor,
role and remark. The service layer enforces valid transitions:

```
                 ┌─────────────┐
                 │  SUBMITTED  │
                 └──────┬──────┘
                        ▼
                 ┌──────────────┐        ┌───────────┐
                 │ UNDER_REVIEW │ ─────▶ │ REJECTED  │  (terminal)
                 └──────┬───────┘        └───────────┘
                        ▼
                 ┌──────────────┐
                 │   ASSIGNED   │
                 └──────┬───────┘
                        ▼
                 ┌──────────────┐
                 │ IN_PROGRESS  │
                 └──────┬───────┘
                        ▼
                 ┌──────────────┐        ┌───────────┐
                 │   RESOLVED   │ ─────▶ │  CLOSED   │  (terminal)
                 └──────────────┘        └───────────┘
```

| Priority | SLA target |
|---|---|
| LOW | 15 days |
| MEDIUM | 10 days |
| HIGH | 5 days |
| CRITICAL | 2 days |

---

## Running in VS Code

Recommended extensions (VS Code will prompt you — see `.vscode/extensions.json`):

- **ESLint** and **ES7+ React/Redux snippets** for the frontend
- **Node.js** tooling for the backend

Suggested workflow:

1. Open the `civic-pulse` folder in VS Code.
2. **Instant demo:** open a terminal, `cd frontend`, run `npm install` then
   `npm run dev`. Vite opens the browser automatically.
3. **Full stack:** run `npm run dev` from `backend`, set
   `VITE_USE_MOCK_API=false` in `frontend/.env`, then start the frontend.

Available frontend scripts:

```bash
npm run dev       # start the Vite dev server (http://localhost:5173)
npm run build     # production build into frontend/dist
npm run preview   # preview the production build
npm run lint      # run ESLint
```

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Frontend loads but shows no data | Ensure `frontend/.env` exists with `VITE_USE_MOCK_API=true`, then restart `npm run dev`. |
| Login fails against the real backend | Confirm the Node backend is running on `:8080` and MySQL is up; check the terminal for database errors. |
| `403` / CORS errors in the browser | Set `APP_CORS_ORIGINS` to include your frontend origin, or keep using the Vite proxy (default). |
| Port already in use | Change `server.port` (backend) or the Vite `server.port` (frontend). |
| Want to re-seed the database | Drop the `civicpulse` schema and restart the backend (seeds only when empty). |

---

## Project scope & disclaimer

This is an academic mini-project built for learning purposes. The AI-based
issue categorisation described in the synopsis' *Future Scope* is represented
here by a deterministic rule engine (category → department routing). The default
credentials and JWT secret are for local demonstration only and **must** be
changed before any real-world use.
