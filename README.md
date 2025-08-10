## CollabMarket – Farcaster Collaborators Marketplace

A Next.js Mini App for discovering collaborators and projects in the Farcaster ecosystem. Users can post projects, create collaborator profiles, express interest, manage an inbox, and report abuse. Admins can review reports and shadow-ban abusers.

### Highlights
- **Feeds**: Searchable, filterable lists of projects and collaborators
- **Profiles**: Public collaborator profiles with skills, availability, and preferences
- **Projects**: Owner-managed listings with roles, contact, and incentives
- **Interest Flow**: One-tap interest and owner inbox with accept/dismiss
- **Auth**: Farcaster Mini App QuickAuth
- **Admin**: Abuse reporting, review, and moderation actions
- **Security**: CSRF protection and secure headers middleware

---

## Stack
- **App**: Next.js 15, React 19, TypeScript
- **DB/ORM**: PostgreSQL 16 (Docker), Prisma 6
- **UI**: Tailwind CSS (v4)
- **Mini App**: `@farcaster/miniapp-sdk`
- **Security**: Edge middleware with CSRF + security headers

Repository layout:
- `web/`: Next.js app (APIs under `app/api`, UI under `app/`)
- `web/prisma/`: Prisma schema and migrations
- `web/scripts/`: Utilities (seed, indexes, digest, e2e auth)
- `docker-compose.yml`: Local Postgres service
- `RUNBOOK.md`, `farcaster_collaborators_marketplace_spec.md`, `farcaster_collaborators_marketplace_dev_schedule.md`

---

## Quickstart (Local)

### Prerequisites
- Docker (for Postgres)
- Node.js 20+ and npm

### 1) Start Postgres
```bash
cd /workspace
docker compose up -d db
```
Postgres will be available at `localhost:5432` with database `collabmarket` and user/password `postgres`.

### 2) Configure environment
Create `web/.env` with the following variables (adjust as needed):
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/collabmarket?schema=public"

# Sessions & Admin
SESSION_SECRET="replace-with-strong-secret"
ADMIN_FIDS=""  # comma-separated FIDs for admin access

# Farcaster / Webhooks
MINIAPP_QUICKAUTH_JWT_SECRET="replace-with-quickauth-secret"
WEBHOOK_SECRET="replace-with-webhook-secret"
ERROR_WEBHOOK_URL=""  # optional: error alert sink

# Client
NEXT_PUBLIC_BASE_URL="http://localhost:3000"  # used for server fetch URLs
```

### 3) Install deps and generate Prisma client
```bash
cd /workspace/web
npm install
npm run prisma:generate
```

### 4) Create schema and apply migrations
```bash
npm run prisma:migrate
# or for prototyping
# npm run db:push
```

### 5) Optional: seed and add DB indexes (FTS / trigram)
```bash
npm run seed
npm run db:indexes
```

### 6) Run the app
```bash
npm run dev
# open http://localhost:3000
```

---

## Scripts (web/package.json)
- `dev`: Start Next.js dev server
- `build` / `start`: Production build and serve
- `lint`: Lint codebase
- `prisma:generate`: Generate Prisma client
- `prisma:migrate`: Apply a dev migration (named `init` by default)
- `db:push`: Push schema to DB without migration
- `seed`: Seed minimal starter content
- `db:indexes`: Create FTS/trigram indexes for search
- `digest`: Run daily digest job stub (logs top listings)
- `e2e:auth`: Minimal auth E2E (expects running server)

---

## Database Model (Prisma)
Core tables:
- `users`: Farcaster users (fid, handle, avatar, links, flags)
- `collaborator_profiles`: Skills, bio, availability, categories, visibility
- `projects`: Owner, pitch, category, onchain, contact, incentives, status
- `project_roles`: Roles/skills per project
- `interests`: Interest requests from users to project owners
- `signals`: External user signals/links
- `abuse_reports`: Report records with reporter, target, reason

See `web/prisma/schema.prisma` for details. Migrations are in `web/prisma/migrations/`.

---

## API Overview
All routes live under `web/src/app/api/`.

Public/General:
- `GET /api/health`: Health check
- `GET /api/projects`: List/search projects (filters, pagination)
- `GET /api/collaborators`: List/search collaborator profiles
- `POST /api/report`: Create abuse report

Auth/Session:
- `GET /api/me`: Current user profile
- `GET /api/auth/csrf`: CSRF token helper
- `POST /api/auth/callback`: Farcaster QuickAuth callback
- `POST /api/auth/logout`: Logout and clear session

Projects & Interests:
- `POST /api/projects`: Create project (auth required)
- `GET /api/projects/[id]`: Get project by id
- `PATCH /api/projects/[id]`: Update by owner
- `POST /api/projects/[id]/interest`: Send interest

Collaborator Profiles:
- `GET /api/collaborators`: Query profiles
- `POST /api/collaborators`: Create/update my profile

Inbox:
- `GET /api/inbox`: Owner inbox of interests with accept/dismiss actions
- `POST /api/interests/[id]/accept` / `.../dismiss`: via subroutes under interests

Admin:
- `GET /api/admin/reports`: Review queue
- `POST /api/admin/reports/[id]/resolve`: Resolve report
- `POST /api/admin/users/[id]/shadow-ban` / `.../unshadow-ban`

Webhooks:
- `POST /api/webhooks/farcaster`: Mini App events (use `WEBHOOK_SECRET`)

Note: Many write routes require CSRF and a valid session.

---

## Security
- **CSRF**: Edge middleware sets a cookie `cm_csrf` and expects header `x-csrf-token` to match on state-changing requests (POST/PUT/PATCH/DELETE). The middleware exposes `x-csrf-header` and `x-csrf-token` in responses to help clients echo the header back.
- **Headers**: Middleware adds `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, and a conservative `Content-Security-Policy` for local/dev. Adjust CSP for production and Mini App container.
- **Sessions**: Signed using `SESSION_SECRET`. Admin checks read `ADMIN_FIDS`.

Client example (fetch):
```ts
const res = await fetch("/api/projects", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-csrf-token": getCookie("cm_csrf"),
  },
  body: JSON.stringify(payload),
});
```

---

## Deployment
- Provide a managed PostgreSQL DB and set `DATABASE_URL`
- Set required secrets: `SESSION_SECRET`, `MINIAPP_QUICKAUTH_JWT_SECRET`, `WEBHOOK_SECRET`
- Optional: `ADMIN_FIDS`, `ERROR_WEBHOOK_URL`, `NEXT_PUBLIC_BASE_URL`
- Build and start:
```bash
cd web
npm ci
npm run build
npm run start
```

---

## References
- Runbook: `RUNBOOK.md`
- Product Spec: `farcaster_collaborators_marketplace_spec.md`
- Dev Schedule: `farcaster_collaborators_marketplace_dev_schedule.md`
- App-level README: `web/README.md`
