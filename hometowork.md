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

| Service | Key set? | Notes |
|---------|----------|-------|
| Supabase URL + Anon | ✅ YES | Live project: `lpxqzsudbjovpkydmstv.supabase.co` |
| Supabase Service Role | ✅ YES | Connected |
| Stripe Secret | ✅ YES | Live key connected |
| Stripe Publishable | ✅ YES | Live key connected |
| Stripe Webhook Secret | ❌ NO | Need to create webhook endpoint in Stripe Dashboard → copy `whsec_...` |
| Stripe Price IDs (x3) | ✅ YES | Starter/Professional/Coach prices connected |
| Anthropic API Key | ✅ YES | Connected (+ SAFETYLENS_ANTHROPIC_KEY alias) |
| Resend API Key | ✅ YES | Connected |

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

### DONE
- [x] Full Next.js project structure
- [x] All page routes (auth, dashboard, analyze, audits, coach, projects, settings)
- [x] All API routes (analyze, audits CRUD, coach, stripe checkout/portal/webhook, usage)
- [x] All components (UI kit, analyze flow, coach flow, dashboard)
- [x] Hooks (auth, plan, usage, speech recognition/synthesis)
- [x] Lib modules (Anthropic client + prompts, Stripe, Supabase client/server/admin)
- [x] TypeScript types
- [x] Tailwind v4 + globals.css
- [x] Marketing landing page + nav/footer
- [x] Git repo + GitHub remote configured
- [x] Auto-push watch script
- [x] **Supabase project created** — DB live at `lpxqzsudbjovpkydmstv.supabase.co`
- [x] **Migrations applied** — all 6 tables exist (profiles, projects, audits, observations, coach_sessions, usage_logs)
- [x] **Storage bucket** — `audit-photos` bucket created (private)
- [x] **Stripe account + 3 products** — Starter ($29), Professional ($49), Coach ($89) with real price IDs
- [x] **Stripe price IDs in .env.local** — all 3 connected
- [x] **Anthropic API key** — connected (+ SAFETYLENS_ANTHROPIC_KEY alias to avoid Claude Code collision)
- [x] **Resend API key** — connected
- [x] **Anthropic client refactored** — lazy init with proxy for backward compat
- [x] **Debug logging** — added to analyze flow for troubleshooting

### NOT DONE YET
- [ ] **Stripe webhook secret** — need to create endpoint in Stripe Dashboard, copy `whsec_...` to `.env.local`
- [ ] **End-to-end testing** — auth flow, photo analysis, coach, payments untested
- [ ] **Remove debug logging** — clean up console.log statements before production
- [ ] **Error handling polish** — basic structure, needs edge cases
- [ ] **Deployment** — Vercel, env vars, domain

---

## Known Issues / Gotchas
- `.env.local` IS in `.gitignore` — you'll need to copy it manually between machines or use a secure sync
- Default git branch was `master` globally; renamed to `main` locally for this repo
- PowerShell execution policy was set to `RemoteSigned` (CurrentUser scope) to allow scripts
- `.claude/settings.local.json` has "allow all" permissions — Claude Code won't prompt for approvals

---

## CURRENT SESSION

> **Update this section before ending every work session.**

| Field | Value |
|-------|-------|
| Date | 2026-03-10 |
| Location | LAPTOP |
| Last commit | `4e80d4a` — debug logging + Anthropic client refactor |
| Dev server status | Not running |
| Errors at close | None |

### What was done this session
- Verified all Supabase migrations are applied (6 tables + storage bucket confirmed)
- Verified Stripe products exist (3 plans with real price IDs)
- Updated `.env.local` with real Stripe price IDs (were still placeholders)
- Updated `hometowork.md` handoff doc to reflect actual progress
- Pushed latest commit to GitHub

### Next steps
1. **Stripe webhook** — go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks), create endpoint pointing to `https://your-domain.com/api/stripe/webhook`, copy `whsec_...` to `.env.local`
2. **End-to-end testing** — `npm run dev` → test auth → test photo analysis → test coach → test billing
3. **Remove debug logging** — clean up `console.log('[DEBUG]...')` statements before production
4. **Error handling polish** — edge cases, user-friendly error messages
5. **Deployment** — Vercel, env vars, custom domain

### Notes
- `.env.local` now has all real keys EXCEPT `STRIPE_WEBHOOK_SECRET` (still placeholder)
- Anthropic client uses `SAFETYLENS_ANTHROPIC_KEY` env var to avoid collision with Claude Code's own `ANTHROPIC_API_KEY`
- Git user is set globally: `Carlos Reynoso <carlosreynoso96@gmail.com>`

---

## Session Log

| Date | Location | Summary |
|------|----------|---------|
| 2026-03-04 | HOME | Initial scaffolding complete. All pages, components, API routes, hooks, libs, types, SQL migrations written. GitHub repo created + pushed. Set up gitignore, hometowork.md handoff, auto-push script with power management, Claude Code auto-allow. Next: connect Supabase/Stripe/Anthropic on laptop. |
| 2026-03-05 | LAPTOP | Connected all services: Supabase project created + migrations applied (6 tables + storage bucket), Stripe account + 3 products created, Anthropic + Resend keys added. Refactored Anthropic client for env key flexibility. Added debug logging to analyze flow. |
| 2026-03-10 | LAPTOP | Verified all services connected. Updated .env.local with real Stripe price IDs (were still placeholders). Updated handoff doc to reflect actual status. Remaining: Stripe webhook secret, E2E testing, cleanup debug logs, deployment. |
