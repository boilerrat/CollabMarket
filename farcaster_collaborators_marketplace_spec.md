
# Farcaster Mini App: Collaborators Marketplace – Tech Spec

## Goal
- Match builders with projects, and projects with collaborators.
- Run as a Mini App inside Farcaster. Load fast. Zero learning curve.
- Ship an MVP in one sprint, then iterate.

## Primary User Flows
- **Post a project**: Define roles, skills, commitment, start date, incentives, contact.
- **Offer skills**: Define skills, experience, availability, interests, preferred comp.
- **Browse and filter**: Search by skill, stack, category, time commitment, availability.
- **Quick match**: One-tap “I’m interested” sends the project owner a contact card.
- **Signal and trust**: Show Farcaster handle, mutual follows, public links to past work.
- **Notify**: Owner receives a Mini App notification when someone requests to connect.

## MVP Scope
- Public directory of project posts and collaborator cards
- Auth with Farcaster
- Post creation, edit, archive
- Filters and keyword search
- Interest requests, inbox for owners
- Daily digest cast of new listings
- Basic abuse controls and rate limits

## Out of Scope (Phase 1)
- In-app chat (use link-out to DMs or email)
- Payments or escrow
- On-chain attestations (planned for Phase 2)

## Platform Requirements
- Use Farcaster MiniApp SDK (`sdk.actions.ready` on load)
- Provide manifest at `/.well-known/farcaster.json`
- Mini Apps only (Frames v1 deprecated)
- Node 22.11+ for dev and builds

## Tech Stack
- **Frontend**: Next.js 14, MiniApp SDK, React Server Components
- **Styling**: Tailwind or CSS Modules
- **State**: React Query
- **Backend**: Node, Postgres, Prisma, Redis
- **Hosting**: Vercel/Fly.io + Neon/Supabase
- **Search**: Postgres full text + trigram
- **Notifications**: Mini App server events → webhook → SDK actions
- **Integrations**: Neynar starter kit

## Key Integrations
- Farcaster sign-in (store `fid`, custody address)
- MiniApp SDK
- Manifest with name, icon, URL, webhook

## Data Model
### users
- id, fid, handle, display_name, avatar_url
- email (opt), public_links (jsonb), created_at

### collaborator_profiles
- id, user_id, skills[], bio, availability_hours_week
- categories[], location, comp_preference, visibility
- created_at, updated_at

### projects
- id, owner_user_id, title, pitch, category
- onchain (bool), repo_url, contact_method, contact_value
- commitment, start_date, incentives[], status
- created_at, updated_at

### project_roles
- id, project_id, skill, level, count

### interests
- id, project_id, from_user_id, message, status, created_at

### signals
- id, user_id, type, url

### abuse_reports
- id, reporter_user_id, target_kind, target_id, reason, created_at

## API Endpoints
- `POST /api/auth/callback`
- `GET /api/me`
- `GET /api/projects?filters`
- `POST /api/projects`
- `PATCH /api/projects/:id`
- `POST /api/projects/:id/interest`
- `GET /api/inbox`
- `POST /api/report`
- `GET /api/collaborators?filters`
- `POST /api/collaborators`

## Search & Filters
- Keyword: title, pitch, skills
- Filter: skill, category, onchain, commitment, availability
- Sort: newest, active, mutual follows

## Matching Logic
```
score = skill_overlap + freshness + availability_fit + mutual_follow_bonus
```
- Skill overlap: intersecting skills
- Freshness: decay over 21 days
- Availability fit: match hours/week range
- Mutual follow bonus: later integration

## Auth & Session
- Farcaster sign-in
- Session cookie (`httpOnly`, secure, sameSite strict)
- CSRF token on writes

## UX
- Splash → `sdk.actions.ready` after data load
- Tabs: Projects, Collaborators, Post, Inbox
- Card layout: title, pitch, skills, commitment, CTA
- One-tap interest → notify owner
- “Add App” prompt after first success

## Notifications
- New interest → notify owner
- Daily digest cast with top listings

## Manifest Example
```json
{
  "name": "Collaborators",
  "iconUrl": "https://yourapp.com/icon.png",
  "splashImageUrl": "https://yourapp.com/splash.png",
  "webhookUrl": "https://api.yourapp.com/miniapp/webhook",
  "homescreenUrl": "https://yourapp.com",
  "supportedApis": ["miniapp.v1"]
}
```

## Frontend Snippet
```js
import { sdk } from "@farcaster/miniapp-sdk";

async function appInit() {
  await hydrateData();
  await sdk.actions.ready();
}
```

## Security & Abuse
- Auth for all write endpoints
- Rate limit by fid + IP
- Keyword filter scams
- One-click report, admin review
- Soft delete, shadow ban

## Privacy
- Minimal data collection
- No wallets in MVP
- Delete/export profile

## Analytics
- Track: views, clicks, posts, interests
- Funnel: view → interest → accept
- Weekly retention

## Observability
- Managed logging
- API health checks
- Error/webhook failure alerts

## Performance
- Edge cache GETs
- Cursor pagination
- Lazy load images
- P95 TTI < 1.5s mobile

## Test Plan
- Unit: matching, filters, rate limits
- E2E: auth, post, browse, interest, inbox
- Manual QA in desktop + mobile dev mode

## Roadmap
### Phase 1 (2 weeks)
- Auth, posting, browsing, interest, inbox, digest cast

### Phase 2 (3–4 weeks)
- GitHub, POAP, NFT signals
- EAS attestations

### Phase 3
- Smart recommendations, social graph, referrals

### Phase 4
- Monetization: featured posts, sponsored digest, success fee

## Setup Steps
- Enable Farcaster developer mode
- Scaffold with CLI or Neynar starter
- Add MiniApp SDK
- Add manifest at `/.well-known/farcaster.json`
- Implement `sdk.actions.ready`
- Deploy to public URL

## Deliverables
- Next.js app repo
- API + Prisma schema
- Manifest + icons
- Admin dashboard
- Deploy/runbook docs
