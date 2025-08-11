# Repository Guidelines

## Project Structure & Module Organization
- Root contains `web/` (Next.js app), `.github/` (CI), and `docker-compose.yml` (Postgres for dev).
- App code in `web/src`:
  - `app/` (routes, layouts, pages), `components/` (shared UI), `lib/` (utils, Prisma wrapper), `generated/` (Prisma client — do not edit).
  - Assets in `web/public/`. Database schema in `web/prisma/schema.prisma`.
- Absolute imports via `@/` (e.g., `import { getSession } from '@/lib/session'`).

## Build, Test, and Development Commands
- Install: `cd web && npm ci`.
- Start DB (local): `docker compose up -d db`.
- Prisma: `npm run prisma:generate` (client), `npm run db:push` (sync) or `npm run prisma:migrate` (create dev migration).
- Dev server: `npm run dev` (http://localhost:3000).
- Lint: `npm run lint`.
- Build/Start: `npm run build` then `npm run start`.
- E2E auth helper: `npm run e2e:auth` (see `web/scripts/`).

## Coding Style & Naming Conventions
- Language: TypeScript (strict), React 19, Next.js 15.
- ESLint: extends `next/core-web-vitals` and `next/typescript`.
- Style: 2‑space indent, prefer single quotes, allow trailing commas.
- Naming: PascalCase components (e.g., `ProjectCard.tsx`), camelCase vars/functions, kebab-case route segments.
- Structure: colocate component styles; keep server/client boundaries clear in `app/` per Next conventions.

## Testing Guidelines
- No unit framework configured yet; keep changes lint‑clean and buildable.
- Prefer unit tests under `web/src/__tests__/` (e.g., `Button.test.tsx`) if introduced.
- Prefer E2E via Playwright under `web/tests/` when added.
- CI (Node 22) runs: install → Prisma generate → lint → build.

## Commit & Pull Request Guidelines
- Commits: concise, imperative; prefer Conventional Commits (e.g., `feat(web): add project role list`).
- PRs: link issues, describe scope/behavior, include screenshots for UI, and note DB schema changes (include migration command used).
- Keep PRs focused; update docs when adding scripts or env vars.

## Security & Configuration Tips
- Env: `web/.env` holds `DATABASE_URL` for local dev; do not commit secrets. Use `.env.local` for personal overrides.
- Prisma client output in `web/src/generated/prisma` — never edit by hand.

