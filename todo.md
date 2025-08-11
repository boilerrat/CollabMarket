### To‑Do (Remaining MVP → Production)

- Auth/session
  - Verify Farcaster Quick Auth token server‑side; derive fid/handle from claims; mint signed session cookie
  - Add logout endpoint/action; handle token refresh/failure states
  - Optional: enable auto sign‑in only inside FC client; feature flag for dev
  - Docs: Farcaster Auth `https://miniapps.farcaster.xyz/docs/guides/auth`

- Manifest, embeds, notifications
  - Fill manifest with homescreenUrl, icon, webhookUrl; add domain verification signature
  - Implement webhook receiver and trigger owner notifications on new interest (when skillMatch true)
  - Add fc:miniapp meta tags for shareable pages (projects, project details)
  - Docs: Manifest vs Embed `https://miniapps.farcaster.xyz/docs/guides/manifest-vs-embed`, Notifications FAQ `https://miniapps.farcaster.xyz/docs/guides/faq`

- Projects
  - Edit/Archive endpoints and UI
  - Feed: pagination, sorting (newest/active), filters (skills multi, type), empty states
  - Show owner handle/avatar; link to Warpcast profile
  - Improve details page: richer layout, skills badges, owner info

- Collaborators
  - List/browse with pagination; filters: skills multi, project types, search
  - Profile details page; richer fields (links, availability, categories)
  - Keep “View on Farcaster” and “Cast to @handle”; consider a “copy contact card” CTA

- Interests and Inbox
  - Inbox: show status chips, timestamps, message preview; pagination
  - Add “mark as read”; owner reply link (Warpcast compose)
  - Outbox: list interests I’ve sent
  - Rate‑limit interest posting; dedupe same user/project

- Data model and DB
  - Add `project_roles` table; indexes for text search (title/pitch) and trigram
  - Migrations for new fields (owner metadata, profile links), constraints
  - Add simple seed script

- API hardening
  - Server input validation (Zod/Pydantic‑style), consistent error shapes
  - Authorization checks for owner‑only edits
  - Caching headers for GET lists; revalidate on writes

- Security
  - CSRF on writes, secure cookies, CORS, security headers, CSP
  - Basic abuse controls and report endpoint (from spec)

- UI/UX polish (shadcn/ui)
  - Multi‑selects for skills/types (done for projects; add to filters)
  - Skeletons/loaders, toasts (done), empty states, error banners
  - Mobile layout checks; accessibility pass

- Performance/analytics/observability
  - Track views/clicks/creates/interests
  - Error tracking; webhook failure alerts
  - Cache GET feeds; image lazy loading; measure P95 TTI

- Deployment
  - Vercel app + managed Postgres; env config; health checks
  - Add production manifest and public icons

- Testing
  - Unit tests (schema, matching, filters)
  - Integration/E2E: auth flow, post project, browse, interest, inbox actions

