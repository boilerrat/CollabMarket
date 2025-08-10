
# Farcaster Mini App: Collaborators Marketplace – Daily Development Schedule

## Day 1 – Mon Aug 11, 2025
**Goals**
- Repo, environments, Mini App scaffold, manifest, SDK ready.

**Tasks**
- Init repo, CI, branch rules. Create env files.
- Scaffold Next.js 14. Install MiniApp SDK.
- Add `/.well-known/farcaster.json` with webhook and homescreen URL.
- Add minimal home view. Call `sdk.actions.ready` after data load.
- Set up Postgres, Prisma, initial migration.
- Add logging, error handler, rate limit middleware.

**Done**
- App opens inside Farcaster. SDK ready fires.
- Manifest served. Health check passes.
- CI builds main.

## Day 2 – Tue Aug 12
**Goals**
- Farcaster auth, sessions, user table.

**Tasks**
- Implement sign-in with Farcaster. Store fid, handle, avatar.
- Create users table. Link session to fid.
- Add `/api/me`. Add auth guard for write routes.
- Set secure cookies. CSRF on POST, PATCH.

**Done**
- New user signs in, `/api/me` returns profile.
- Session survives refresh, logout works.
- Auth E2E test green.

## Day 3 – Wed Aug 13
**Goals**
- Project posting CRUD, validation, rate limits.

**Tasks**
- DB: projects, project_roles.
- API: `POST /api/projects`, `PATCH /api/projects/:id`, archive.
- Zod validation, safe HTML. Return normalized payloads.
- Owner-only edits. Per-fid rate limit.

**Done**
- Create, edit, archive from UI.
- Invalid payloads blocked.
- Unit tests for schema and perms.

## Day 4 – Thu Aug 14
**Goals**
- Collaborator profiles CRUD.

**Tasks**
- DB: collaborator_profiles.
- API: `GET/POST /api/collaborators`.
- UI: create or update profile. Availability, skills, comp preference.
- Visibility toggle.

**Done**
- Profile created and shown in list.
- Filters read skills and availability.
- Tests for profile perms.

## Day 5 – Fri Aug 15
**Goals**
- Feeds, filters, search, pagination, indexing.

**Tasks**
- API: `GET /api/projects?filters`, `GET /api/collaborators?filters`.
- Postgres FTS on title, pitch. Trigram index.
- Cursor pagination. Sort by newest and active.
- UI: tabbed feeds. Card layout. Empty states.

**Done**
- Search returns relevant items under 150 ms on dev data.
- Pagination stable across refresh.
- Lighthouse perf baseline recorded.

## Day 6 – Sat Aug 16
**Goals**
- Interest flow, inbox, notifications webhook.

**Tasks**
- DB: interests.
- API: `POST /api/projects/:id/interest`, `GET /api/inbox`.
- UI: One-tap Interest with confirm. Owner inbox with accept, dismiss.
- Implement webhook receiver for Mini App events. Send owner notification on new interest.

**Done**
- Owner receives notification inside Mini App.
- Inbox shows request, status updates.
- E2E covering send, receive, accept.

## Day 7 – Sun Aug 17
**Goals**
- Abuse controls, admin basics.

**Tasks**
- DB: abuse_reports. Soft delete flags on users, projects, profiles.
- API: `POST /api/report`. Admin endpoints behind role.
- Keyword and link checks on submit.
- Admin view: queue, resolve, shadow ban.

**Done**
- Reported post hidden after admin action.
- Spam submit throttled.
- Tests for report flow and bans.

## Day 8 – Mon Aug 18
**Goals**
- Performance, analytics, observability.

**Tasks**
- Edge cache GET feeds. Revalidate on write.
- Image optimization, lazy load.
- Add anonymous analytics events: view, click, post, interest.
- Error tracking and alert on webhook failures.

**Done**
- P95 TTI under 1.5 s on mobile test.
- Dashboards show traffic and error rate.
- Synthetic check for webhook passing.

## Day 9 – Tue Aug 19
**Goals**
- QA sweep, accessibility, copy polish.

**Tasks**
- Mobile and desktop QA inside Farcaster.
- Keyboard nav, focus rings, aria labels.
- Copy pass on forms, toasts, errors.
- Security pass. CSRF, headers, CORS, CSP.

**Done**
- A11y checks pass. No blocked flows.
- All high and medium bugs closed.
- Security checklist signed.

## Day 10 – Wed Aug 20
**Goals**
- Launch, digest bot, backlog plan.

**Tasks**
- Production deploy. Run DB migrations.
- Seed minimal starter content.
- Add “Add App” prompt after first success action.
- Set up daily digest cast job, top new listings.
- Create runbook, rollback plan, on-call notes.
- Log backlog for Phase 2 signals and attestations.

**Done**
- Mini App listed and shareable.
- Digest cast posts at the set time.
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
