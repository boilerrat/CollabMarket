# Repository Guidelines

## Project Structure & Module Organization
- Root contains `web/` (Next.js app), `.github/` (CI), and `docker-compose.yml` (Postgres for dev).
- App code lives in `web/src`:
  - `app/` (file‑based routes, layouts, pages), `components/` (shared UI), `lib/` (utilities, Prisma client wrapper), `generated/` (Prisma client — do not edit).
  - Static assets in `web/public/`. Database schema in `web/prisma/schema.prisma`.
- Absolute imports via `@/` (e.g., `import { getSession } from "@/lib/session"`).

## Build, Test, and Development Commands
- Install: `cd web && npm ci`
- Run database (local): `docker compose up -d db` (uses `postgres:16-alpine`).
- Prisma: `npm run prisma:generate` (generate client), `npm run db:push` (sync schema) or `npm run prisma:migrate` (create dev migration).
- Dev server: `npm run dev` (Next.js at http://localhost:3000)
- Lint: `npm run lint` (Next.js + ESLint rules)
- Build/Start: `npm run build` then `npm run start`
- E2E auth script: `npm run e2e:auth` (helper under `web/scripts/`).

## Coding Style & Naming Conventions
- Language: TypeScript (strict), React 19, Next.js 15.
- Style: ESLint extends `next/core-web-vitals` and `next/typescript`. Indentation 2 spaces; prefer single quotes; trailing commas allowed.
- Naming: PascalCase for components (`ProjectCard.tsx`), camelCase for variables/functions, kebab-case for route segments.
- Structure: colocate component styles; keep server/client code clear in `app/` per Next conventions.

## Testing Guidelines
- No unit test framework is configured yet. Keep changes lint‑clean and buildable.
- Prefer adding tests under `web/src/__tests__/` (Jest/Vitest) or E2E via Playwright in `web/tests/` if introduced in a PR.
- CI (Node 22) runs install → Prisma generate → lint → build.

## Commit & Pull Request Guidelines
- Commits: concise, imperative present tense. Prefer Conventional Commits: `feat(web): add project role list`.
- PRs: link related issues, describe scope and behavior, include screenshots for UI changes, and note DB schema changes (with migration command used).
- Keep PRs small and focused; update docs if you add scripts or env variables.

## Security & Configuration Tips
- Env: `web/.env` holds `DATABASE_URL` for local dev. Do not commit secrets; prefer `.env.local` for personal overrides.
- Prisma output is generated under `web/src/generated/prisma` — never edit by hand.
