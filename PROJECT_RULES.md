## Collaborators Marketplace – Project Rules (MVP)

These rules operationalize the spec and 10‑day schedule for a Farcaster Mini App MVP. Default to simplicity, ship fast, and keep quality high.

### Core Principles
- **MVP focus**: Deliver Phase 1 scope only. Defer Phase 2+ (signals, attestations) to backlog.
- **Mini App first**: Load fast, zero learning curve, mobile-first UX. Call `sdk.actions.ready()` only after initial data hydrate.
- **Secure by default**: Auth required on all writes. Cookies are `httpOnly`, `secure`, `sameSite=strict`. CSRF on POST/PATCH.
- **Consistency over cleverness**: Prefer explicit, readable code. Document tradeoffs in PRs.

### Architecture & Stack
- **Frontend**: Next.js 14 (React Server Components), Tailwind CSS (default) or CSS Modules, React Query for data fetching and cache.
- **Backend**: Node 22.11+, Prisma ORM, Postgres (Neon/Supabase), Redis for rate limiting and cache, Neynar starter where applicable.
- **Search**: Postgres full‑text + trigram indexes.
- **Hosting**: Vercel or Fly.io for app; managed Postgres; Redis provider.
- **Mini App SDK**: Integrate `@farcaster/miniapp-sdk`; serve manifest at `/.well-known/farcaster.json`.

### Source Control & Workflow
- **Branches**: `main`, `dev`, `feature/*` short‑lived. Rebase/fast‑forward preferred, avoid long‑running branches.
- **PRs**: Max ~400 LOC changed; include scope, screenshots, tests, and rollout notes. Require 1 reviewer.
- **Commits**: Conventional Commits (feat, fix, chore, docs, test, refactor, perf, build, ci).
- **Cadence**: Daily standup 09:30, code freeze 17:00 with E2E + nightly tag; demos end of Day 5 and Day 10.

### Definition of Done (MVP)
- Spec compliance for the touched area (flows: post, profile, browse, interest, inbox, report).
- Tests: unit where logic exists; critical E2E unaffected and green.
- A11y basics (focus, aria labels) and mobile checks pass in Farcaster.
- No P0/P1 bugs; performance budget not regressed; logs and metrics healthy.

### API Design Rules
- **Style**: REST JSON over HTTPS. Snake_case in DB, camelCase in JSON.
- **Auth**: Farcaster sign‑in; session cookie bound to `fid`. All write routes require auth and CSRF token.
- **Endpoints (Phase 1)**: Implement only those listed in spec. No extra surface area.
- **Validation**: Zod schemas on all inputs. Reject unknown fields. Normalize outputs.
- **Pagination**: Cursor‑based. Include `nextCursor` when more results exist.
- **Filtering**: Validate enums (skill, category, commitment). Safe keyword search.
- **Rate limits**: Per `fid` + IP via Redis. Clear error with retry‑after.
- **Idempotency**: For actions that can be retried (e.g., interest), accept an optional idempotency key.
- **Errors**: Use typed error helpers. Return consistent `{ error: { code, message } }`.

### Data Model & Persistence
- **Tables**: As in spec (`users`, `collaborator_profiles`, `projects`, `project_roles`, `interests`, `signals`, `abuse_reports`).
- **Soft delete & visibility**: Implement soft delete flags; hide from feeds by default when flagged.
- **Timestamps**: `created_at`, `updated_at` maintained by DB defaults/triggers where possible.
- **Migrations**: One migration per feature PR; never edit past migrations; review plans on CI.
- **Indexes**: FTS + trigram on title/pitch; foreign keys with `ON DELETE CASCADE` where safe.

### Security & Privacy
- **Sessions**: `httpOnly`, `secure`, `sameSite=strict`. Rotate secrets, per‑env keys. Session TTL reasonable; renew on activity.
- **CSRF**: Double‑submit or header token on state‑changing requests.
- **Input sanitation**: Strip/escape HTML on text inputs; allow safe markdown subset in pitch if needed.
- **Headers**: CSP, HSTS, X‑Frame‑Options (as compatible with Mini App), X‑Content‑Type‑Options, Referrer‑Policy.
- **Abuse controls**: Keyword/link checks; throttle submissions; admin shadow bans; audit log of admin actions.
- **Data minimization**: Store only fields in spec; deletion/export path for profiles.

### Performance & Caching
- **Budget**: P95 TTI < 1.5s mobile in Mini App container.
- **Caching**: Edge cache GET feeds; tag/invalidate on writes. Cache DB results with short TTL where safe.
- **Images**: Optimize and lazy‑load; serve sized thumbnails.
- **DB**: Use N+1‑safe queries; prefer select lists; monitor slow queries.

### UX & Accessibility
- **Nav**: Tabs: Projects, Collaborators, Post, Inbox.
- **Cards**: Title, pitch, skills, commitment, clear CTA.
- **Flows**: One‑tap Interest with confirm; owner inbox with accept/dismiss.
- **Empty states**: Clear guidance; suggest actions.
- **A11y**: Keyboard nav, focus states, aria labels, color contrast.

### Tailwind Styling Guidelines
- **Default**: Use Tailwind v3 JIT. Keep global CSS minimal (`@tailwind base; @tailwind components; @tailwind utilities`).
- **Design tokens**: Define CSS variables under `:root` and map them into Tailwind theme (colors, spacing, radii, shadows, z-index). Support dark mode via `class` strategy (`dark`).
- **Utilities discipline**: Prefer theme tokens over arbitrary values. Keep `safelist` minimal to control bundle size.
- **Class composition**: Use `clsx` for conditional classes and `tailwind-merge` to resolve conflicts.
- **Variants**: Use `class-variance-authority` (CVA) or `tailwind-variants` for component variants (size, intent, state) instead of ad-hoc strings.
- **A11y primitives**: Use Radix UI headless components; style with Tailwind utilities.
- **Plugins**: Allow `@tailwindcss/forms`, `@tailwindcss/typography`, `@tailwindcss/line-clamp`, and container queries plugin as needed.
- **RSC considerations**: Keep class names static strings where possible; avoid generating class names dynamically at runtime. Use booleans to toggle known classes.
- **When to use CSS Modules**: For rare cases needing complex keyframes, component-scoped animations, or where Tailwind becomes unwieldy.
- **Avoid**: Heavy runtime CSS-in-JS libraries for core surfaces due to Mini App performance constraints.

### Notifications & Digest
- **Interest**: On new interest, notify owner through Mini App webhook → SDK action.
- **Digest**: Daily cast of top new listings (configurable schedule); resilient job with retries and alerting.

### Observability & Analytics
- **Logging**: Structured logs with request IDs, fid, route, latency, error codes. No PII beyond spec.
- **Metrics**: Health checks, error rate, webhook failures. SLOs tied to performance budget.
- **Analytics**: Anonymous events for view, click, post, interest. Respect privacy rules.

### Testing Strategy
- **Unit**: Matching, filters, rate limits, validation schemas.
- **Integration**: DB migrations, auth/session, search queries.
- **E2E**: Auth → post → browse → interest → inbox; report flow; happy path and common failures.
- **CI gates**: Typecheck, lint, unit, E2E smoke, build. Block merge on failure.

### Environments & Secrets
- **Envs**: `.env.local` (dev), `.env.staging`, `.env.production` managed in platform secrets; never committed.
- **Parity**: Staging mirrors production settings where feasible.
- **Secrets**: Rotated, access‑scoped, managed via provider. No secrets in logs or analytics.

### Release & Operations
- **Deploy**: CI builds; run DB migrations; smoke test post‑deploy. Feature flags for risky changes.
- **Rollback**: Keep previous image/build; provide manual rollback steps in runbook.
- **Runbook**: Include on‑call notes, alert routing, known limitations, and common fixes.

### Acceptance Criteria (Phase 1)
- New user signs in; `/api/me` returns profile; session persists and logout works.
- Post project with roles; appears in feed; searchable and paginated.
- Create collaborator profile; appears and searchable.
- Send interest; owner gets notification and inbox item; can accept/dismiss.
- Report flow hides content post admin action.
- P95 TTI < 1.5s mobile; no P0/P1 open.

### Compliance with Farcaster Mini Apps
- Manifest served at `/.well-known/farcaster.json` with correct URLs/icons.
- Only Mini Apps (Frames v1 deprecated); `supportedApis: ["miniapp.v1"]`.
- Call `sdk.actions.ready()` after data hydrate, then render main UI.

### Documentation & Ownership
- **Docs**: Keep `README`, `API.md`, `SCHEMA.prisma`, `RUNBOOK.md` current. Update when behavior changes.
- **Ownership**: Each module (auth, posts, profiles, interests, admin) has a named maintainer for triage during MVP.

### What We Won’t Do in MVP
- No in‑app chat; link out to DMs/email.
- No payments/escrow; no on‑chain attestations.
- No social graph ranking beyond planned freshness and skill overlap.

---

File intent: living document. Amend via PR alongside spec changes.


