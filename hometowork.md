# SafetyLens AI — Session Handoff

> **How to use:** Before ending a session, update the CURRENT SESSION section below.
> When starting a new session (home or work), read this file top-to-bottom to resume instantly.
> After pulling: `cd D:\Downloads\SafetyLens\safetylens-ai && npm run dev`

---

## Quick Resume Checklist

```powershell
# 1. Pull latest
cd D:\Downloads\SafetyLens
git pull origin main

# 2. Install deps (only if package.json changed)
cd safetylens-ai
npm install

# 3. Start dev server
npm run dev
# → http://localhost:3000

# 4. Start auto-push watcher (optional, in separate terminal)
cd D:\Downloads\SafetyLens
.\watch-and-push.ps1
```

---

## Project Overview

| Field | Value |
|-------|-------|
| App | SafetyLens AI — AI-powered jobsite safety audit platform |
| Stack | Next.js 16.1.6 / React 19 / TypeScript / Tailwind v4 |
| AI | Anthropic Claude (photo analysis + safety coach) |
| Auth & DB | Supabase (Auth + Postgres + Storage) |
| Payments | Stripe (3-tier SaaS: Starter / Pro / Coach) |
| Email | Resend |
| Repo | https://github.com/carlosreynoso96-ai/safetylens-ai |
| Local path | `D:\Downloads\SafetyLens\safetylens-ai` |

---

## Env Keys Status

All keys are **placeholder** in `.env.local` — none are live yet.

| Service | Key set? | Notes |
|---------|----------|-------|
| Supabase URL + Anon | NO | Need to create Supabase project |
| Supabase Service Role | NO | Same |
| Stripe Secret | NO | Need Stripe account + products |
| Stripe Publishable | NO | Same |
| Stripe Webhook Secret | NO | `stripe listen --forward-to localhost:3000/api/stripe/webhook` |
| Stripe Price IDs (x3) | NO | Create 3 products in Stripe dashboard |
| Anthropic API Key | NO | https://console.anthropic.com |
| Resend API Key | NO | https://resend.com |

---

## File Structure (source only)

```
safetylens-ai/
├── app/
│   ├── (auth)/          # login, signup, forgot-password
│   ├── (dashboard)/     # main app pages after login
│   │   ├── analyze/     # photo upload → AI analysis
│   │   ├── audits/      # audit list + detail [id]
│   │   ├── coach/       # real-time safety coach (voice + text)
│   │   ├── projects/    # project list + detail [id]
│   │   └── settings/    # account, billing, team
│   ├── api/             # route handlers
│   │   ├── analyze/     # POST photo → Anthropic analysis
│   │   ├── audits/      # CRUD audits
│   │   ├── coach/       # POST text → Anthropic coach reply
│   │   ├── stripe/      # checkout, portal, webhook
│   │   └── usage/       # GET usage stats
│   ├── layout.tsx       # root layout
│   ├── page.tsx         # marketing landing page
│   └── globals.css
├── components/
│   ├── analyze/         # PhotoDropZone, ObservationCard, ExportBar, etc.
│   ├── coach/           # CoachChat, VoiceButton, WalkStartScreen, etc.
│   ├── dashboard/       # Sidebar, StatsCards, RecentAudits, UsageMeter
│   ├── layout/          # AuthGuard, MarketingNav, MarketingFooter
│   ├── marketing/       # Hero
│   └── ui/              # Button, Card, Badge, Input, Modal, Toast, Dropdown
├── hooks/               # useAuth, usePlan, useUsage, useSpeech*
├── lib/
│   ├── anthropic/       # client, analyze, coach
│   ├── constants/       # categories, plans, severity
│   ├── stripe/          # client, helpers
│   ├── supabase/        # client, server, admin, middleware
│   └── utils/           # compress-image, export-csv, export-pdf, format
├── supabase/migrations/ # 001_initial_schema, 002_rls_policies, 003_storage
├── types/               # audit, coach, database, plan, speech.d.ts
├── middleware.ts         # Supabase auth middleware
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## What's Built vs What's Left

### DONE (scaffolded, code written)
- [x] Full Next.js project structure
- [x] All page routes (auth, dashboard, analyze, audits, coach, projects, settings)
- [x] All API routes (analyze, audits CRUD, coach, stripe checkout/portal/webhook, usage)
- [x] All components (UI kit, analyze flow, coach flow, dashboard)
- [x] Hooks (auth, plan, usage, speech recognition/synthesis)
- [x] Lib modules (Anthropic client + prompts, Stripe, Supabase client/server/admin)
- [x] Supabase migration SQL files (schema, RLS policies, storage buckets)
- [x] TypeScript types
- [x] Tailwind v4 + globals.css
- [x] Marketing landing page + nav/footer
- [x] Git repo + GitHub remote configured
- [x] Auto-push watch script

### NOT DONE YET
- [ ] **Supabase project creation** — no real DB connected
- [ ] **Run migrations** — SQL files exist but haven't been applied
- [ ] **Stripe account + products** — no payment processing configured
- [ ] **Anthropic API key** — AI features won't work without it
- [ ] **Resend email** — no transactional email configured
- [ ] **npm install** — `node_modules` exists (dev server ran) but verify after clone
- [ ] **End-to-end testing** — no pages tested with real data
- [ ] **Error handling polish** — basic structure, needs edge cases
- [ ] **Deployment** — Vercel, env vars, domain
- [ ] **`.next/` in .gitignore** — build artifacts are not ignored yet (should add)

---

## Known Issues / Gotchas
- `.next/` build folder is NOT in `.gitignore` — add it to avoid bloating the repo
- `.env.local` IS in `.gitignore` — you'll need to copy it manually between machines or use a secure sync
- Default git branch was `master` globally; renamed to `main` locally for this repo
- PowerShell execution policy was set to `RemoteSigned` (CurrentUser scope) to allow scripts

---

## CURRENT SESSION

> **Update this section before ending every work session.**

| Field | Value |
|-------|-------|
| Date | 2026-03-04 |
| Location | HOME |
| Last commit | `905614a` — initial commit: SafetyLens AI project setup |
| Dev server status | Was running (`npm run dev` in `safetylens-ai/`) |
| Errors at close | None (0 compile errors) |

### What I was working on
- Initial project scaffolding is complete
- Set up GitHub repo and first push
- All source files are written but running against placeholder env vars

### Next steps (pick up here)
1. Add `.next/` to `.gitignore` to stop tracking build artifacts
2. Create Supabase project → get real URL + keys → update `.env.local`
3. Run Supabase migrations (`supabase db push` or paste SQL in dashboard)
4. Create Stripe account → create 3 products → get keys → update `.env.local`
5. Get Anthropic API key → update `.env.local`
6. Test auth flow end-to-end (signup → login → dashboard)
7. Test photo analysis flow (upload → AI response)
8. Test coach flow (text + voice)

### Notes for next session
- The watch-and-push.ps1 script auto-commits when idle for 10 min. Start it in a separate terminal if you want auto-push.
- If you're at a different machine, you'll need to copy `.env.local` manually — it's gitignored.
- To share env between home/work securely, consider using `doppler`, `1password cli`, or a private gist.

---

## Session Log

| Date | Location | Summary |
|------|----------|---------|
| 2026-03-04 | HOME | Initial scaffolding complete. All pages, components, API routes, hooks, libs, types, and SQL migrations written. Pushed to GitHub. |
