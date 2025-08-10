# Runbook: Collaborators Marketplace Mini App

## Deploy
- Env: set `SESSION_SECRET`, `DATABASE_URL`, `ADMIN_FIDS`, `WEBHOOK_SECRET`.
- Migrations: from `web/` run `npm run prisma:generate && npm run prisma:migrate`.
- Build/Start: `npm run build && npm run start`.

## Rollback
- App: redeploy previous build artifact.
- DB: `prisma migrate resolve --rolled-back <migration>` then redeploy.

## On-Call
- Health: `GET /api/health` should return `{ ok: true }`.
- Errors: check API logs for `webhooks/farcaster` failures; return non-200 to trigger retry.
- Rate Limits: project creation capped at 10/hour/user.

## Seed
- From `web/`, run `npm run seed` to load sample users/projects (dev only).

