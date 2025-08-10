
# Farcaster Mini App: Collaborators Marketplace – Daily Development Schedule

## Day 1 – Mon Aug 11, 2025
**Goals**
- Repo, environments, Mini App scaffold, manifest, SDK ready.

**Tasks**
- [x] Init repo and env files. (CI and branch rules pending)
- [x] Scaffold Next.js 14 app and install Mini App SDK.
- [x] Add `/.well-known/farcaster.json` with webhook and homescreen URL.
- [x] Minimal home view and call `sdk.actions.ready()` after data hydrate.
- [x] Initialize Prisma and draft schema. (local Postgres configured; initial migration applied)
- [x] Add security headers middleware. (logging/error handler/rate limit pending)

**Done**
- Manifest served. Health check passes.
- SDK ready wired in client init.
 - CI workflow added (typecheck, lint, build). Branch protections pending.
 - Local Postgres ready; Prisma migration `init` applied.

## Day 2 – Tue Aug 12
**Goals**
- Farcaster auth, sessions, user table.

**Tasks**
- [x] Implement sign-in with Farcaster. Store fid, handle, avatar.
- [x] Create users table. Link session to fid.
- [x] Add `/api/me`. Add auth guard skeleton for write routes.
- [x] Set secure cookies. CSRF middleware for POST/PATCH/PUT/DELETE.
- [x] Wire Mini App sign-in trigger in UI and add logout button.
- [ ] Auth E2E test (session persists; logout clears).

**Done**
- New user can sign in via API callback; `/api/me` returns profile.
- Session cookie is `httpOnly`, `secure`, `sameSite=strict`; CSRF enforced on writes.
- Build and lint green; Prisma client generated.

## Day 3 – Wed Aug 13
**Goals**
- Project posting CRUD, validation, rate limits.

**Tasks**
- [x] DB: projects, project_roles.
- [x] API: `POST /api/projects`, `PATCH /api/projects/:id`, archive.
- [x] Zod validation, safe HTML. Return normalized payloads.
- [x] Owner-only edits. Per-fid rate limit.

**Done**
- Create, edit, archive from UI.
- Invalid payloads blocked.
- Unit tests for schema and perms. (pending)

## Day 4 – Thu Aug 14
**Goals**
- Collaborator profiles CRUD.

**Tasks**
- [x] DB: collaborator_profiles.
- [x] API: `GET/POST /api/collaborators`.
- [x] UI: create or update profile. Availability, skills, comp preference.
- [x] Visibility toggle.

**Done**
- Profile created and shown in list.
- Filters read skills and availability.
- Tests for profile perms. (pending)

## Day 5 – Fri Aug 15
**Goals**
- Feeds, filters, search, pagination, indexing.

**Tasks**
- [x] API: `GET /api/projects?filters`, `GET /api/collaborators?filters`.
- [x] Postgres FTS on title, pitch. Trigram index. (via script)
- [x] Cursor pagination. Sort by newest and active.
- [x] UI: tabbed feeds. Card layout. Empty states.

**Done**
- Search returns relevant items under 150 ms on dev data. (pending)
- Pagination stable across refresh.
- Lighthouse perf baseline recorded. (pending)

## Day 6 – Sat Aug 16
**Goals**
- Interest flow, inbox, notifications webhook.

**Tasks**
- [x] DB: interests.
- [x] API: `POST /api/projects/:id/interest`, `GET /api/inbox`.
- [x] UI: One-tap Interest with confirm. Owner inbox with accept, dismiss. (interest button on cards; accept/dismiss pending)
- [x] Implement webhook receiver for Mini App events. Send owner notification on new interest. (placeholder receiver added)

**Done**
- Owner receives notification inside Mini App. (pending)
- Inbox shows request, status updates.
- E2E covering send, receive, accept. (pending)

## Day 7 – Sun Aug 17
**Goals**
- Abuse controls, admin basics.

**Tasks**
- [x] DB: abuse_reports. Soft delete flags on users, projects, profiles.
- [x] API: `POST /api/report`. Admin endpoints behind role.
- [x] Keyword and link checks on submit.
- [x] Admin view: queue, resolve, shadow ban. (shadow ban endpoints added)

**Done**
- Reported post hidden after admin action.
- Spam submit throttled. (pending)
- Tests for report flow and bans. (pending)

## Day 8 – Mon Aug 18
**Goals**
- Performance, analytics, observability.

**Tasks**
- [x] Edge cache GET feeds. Revalidate on write. (basic cache headers)
- [x] Image optimization, lazy load. (Next/Image in place)
- [x] Add anonymous analytics events: view, click, post, interest. (feed views, interest, create/save)
- [x] Error tracking and alert on webhook failures. (ERROR_WEBHOOK_URL)

**Done**
- P95 TTI under 1.5 s on mobile test. (pending)
- Dashboards show traffic and error rate. (pending)
- Synthetic check for webhook passing. (pending)

## Day 9 – Tue Aug 19
**Goals**
- QA sweep, accessibility, copy polish.

**Tasks**
- [ ] Mobile and desktop QA inside Farcaster.
- [x] Keyboard nav, focus rings, aria labels. (forms labeled)
- [x] Copy pass on forms, toasts, errors. (clearer messages)
- [x] Security pass. CSRF, headers, CORS, CSP. (CSRF + security headers + CSP)

**Done**
- A11y checks pass. No blocked flows. (partial)
- All high and medium bugs closed. (pending)
- Security checklist signed. (pending)

## Day 10 – Wed Aug 20
**Goals**
- Launch, digest bot, backlog plan.

**Tasks**
- [ ] Production deploy. Run DB migrations.
- [x] Seed minimal starter content. (script placeholder)
- [ ] Add “Add App” prompt after first success action.
- [x] Set up daily digest cast job, top new listings. (script stub logs digest)
- [x] Create runbook, rollback plan, on-call notes. (RUNBOOK.md)
- [x] Log backlog for Phase 2 signals and attestations. (documented)

**Done**
- Mini App listed and shareable. (pending)
- Digest cast posts at the set time. (pending)
- Runbook stored in repo. Backlog tickets created.

---

## Weekly Cadence During Build
- Daily standup at 09:30. Status, blockers, next steps.
- Code freeze at 17:00. Merge, run E2E, tag nightly.
- Demo at end of Day 5 and Day 10.

## Branch Plan
- main, dev, feature/* per module. Short-lived branches. PR size under 400 lines.

## Acceptance Checklist for MVP
- Sign-in works for a new Farcaster user.
- Post a project with roles, show in feed, searchable.
- Create a collaborator profile, show in feed, searchable.
- Send interest on a project, owner receives notification and inbox entry.
- Report flow hides content after admin action.
- P95 TTI under 1.5 s on mobile.
- No P0 or P1 bugs open.
