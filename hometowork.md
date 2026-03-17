# Vorsa AI — Session Handoff

> **How to use:** Before ending a session, update the CURRENT SESSION section below.
> When starting a new session (home or work), read this file top-to-bottom to resume instantly.
> After pulling: `cd D:\Downloads\SafetyLens\safetylens-ai\safetylens-ai && npm install && npm run dev`

---

## Quick Resume Checklist

```powershell
# 1. Pull latest
cd D:\Downloads\SafetyLens
git pull origin main

# 2. Install deps (only if package.json changed)
cd safetylens-ai\safetylens-ai
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
| App | **Vorsa AI** (formerly SafetyLens AI) — AI-powered jobsite safety audit platform |
| Domain | **https://getvorsa.ai** (live on Vercel) |
| Stack | Next.js 16.1.6 / React 19 / TypeScript / Tailwind v4 |
| AI | Anthropic Claude (photo analysis + safety coach) |
| Auth & DB | Supabase (Auth + Postgres + Storage) |
| Payments | Stripe (3-tier SaaS: Starter $29 / Professional $49 / Coach $89) |
| Email | Resend (drip sequences + transactional) |
| Cache | Upstash Redis (rate limiting + response caching) |
| Monitoring | Sentry (errors) + Vercel Analytics + UptimeRobot (/api/health) |
| Repo | https://github.com/carlosreynoso96-ai/safetylens-ai |
| Local path | `D:\Downloads\SafetyLens\safetylens-ai\safetylens-ai` |

---

## Env Keys Status

| Service | Key set? | Notes |
|---------|----------|-------|
| Supabase URL + Anon | ✅ YES | Live project: `lpxqzsudbjovpkydmstv.supabase.co` |
| Supabase Service Role | ✅ YES | Connected |
| Stripe Secret | ✅ YES | Live key connected |
| Stripe Publishable | ✅ YES | Live key connected |
| Stripe Webhook Secret | ✅ YES | `whsec_...` configured |
| Stripe Price IDs (x3) | ✅ YES | Starter/Professional/Coach prices connected |
| Anthropic API Key | ✅ YES | Uses `VORSA_ANTHROPIC_KEY` to avoid Claude Code collision |
| Resend API Key | ✅ YES | Connected |
| Upstash Redis URL | ✅ YES | `native-glowworm-73260.upstash.io` |
| Upstash Redis Token | ✅ YES | Connected |
| Sentry DSN | ✅ YES | Connected |
| CRON_SECRET | ⏳ PENDING | Needs to be added to Vercel for daily email cron |
| SLACK_WEBHOOK_URL | ⏳ PENDING | Carlos setting up in Slack — for signup notifications |
| INTERNAL_API_SECRET | ⏳ PENDING | Needs to be added to Vercel — protects referral complete endpoint |

---

## File Structure (source only)

```
safetylens-ai/safetylens-ai/
├── app/
│   ├── (auth)/              # login, signup, forgot-password, reset-password
│   ├── (dashboard)/         # main app pages after login
│   │   ├── analyze/         # photo upload → AI analysis
│   │   ├── audits/          # audit list + detail [id]
│   │   ├── coach/           # real-time safety coach (voice + text)
│   │   ├── projects/        # project list + detail [id]
│   │   └── settings/        # account, billing, team, referral
│   ├── (marketing)/         # public pages with MarketingNav/Footer
│   │   ├── page.tsx         # landing page (Hero, Features, BeforeAfter, CoachDemo, Pricing, EmailCapture)
│   │   ├── blog/            # SEO blog index + [slug] posts (8 articles)
│   │   ├── pricing/         # standalone pricing page
│   │   ├── referral/        # referral program landing page
│   │   ├── contact/         # contact page
│   │   ├── privacy/         # privacy policy
│   │   └── terms/           # terms of service
│   ├── api/
│   │   ├── analyze/         # POST photo → Anthropic analysis
│   │   ├── audits/          # CRUD audits + [id] + export
│   │   ├── coach/           # POST text → Anthropic coach reply
│   │   ├── cron/            # trial-emails (daily cron via Vercel)
│   │   ├── emails/          # welcome email on signup + Slack ping
│   │   ├── health/          # GET health check (DB, Redis, env)
│   │   ├── referrals/       # GET/POST referrals + complete endpoint
│   │   ├── stripe/          # checkout, portal, webhook (with idempotency)
│   │   └── usage/           # GET usage stats (cached)
│   ├── layout.tsx           # root layout (Vercel Analytics + SpeedInsights)
│   ├── sitemap.ts           # dynamic sitemap (includes blog posts)
│   ├── robots.ts            # robots.txt
│   └── globals.css
├── components/
│   ├── analyze/             # PhotoDropZone, ObservationCard, ExportBar, etc.
│   ├── coach/               # CoachChat, VoiceButton, WalkStartScreen, etc.
│   ├── dashboard/           # Sidebar, StatsCards, RecentAudits, UsageMeter, DashboardHeader
│   ├── layout/              # AuthGuard, MarketingNav, MarketingFooter
│   ├── marketing/           # Hero, Features, BeforeAfter, CoachDemo, PricingTable, EmailCapture, StructuredData
│   └── ui/                  # Button, Card, Badge, Input, Modal, Toast, Dropdown
├── hooks/                   # useAuth, usePlan, useUsage, useSpeech*
├── lib/
│   ├── anthropic/           # client, analyze, coach
│   ├── blog/                # posts.ts (8 SEO articles with HTML content)
│   ├── constants/           # categories, plans, severity
│   ├── redis/               # client, cache (Upstash)
│   ├── resend/              # client, emails (welcome, day3, day10, expired)
│   ├── stripe/              # client, helpers
│   ├── supabase/            # client, server, admin, middleware
│   └── utils/               # analytics, compress-image, export-csv, export-pdf, format, rate-limit, referral, slack
├── supabase/migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_rls_policies.sql
│   ├── 003_storage_buckets.sql
│   ├── 004_webhook_events_and_indexes.sql
│   └── 005_referrals.sql
├── types/                   # audit, coach, database, plan, speech.d.ts
├── References/              # marketing-content.md (LinkedIn posts, cold emails, directories, referral copy)
├── middleware.ts             # Supabase auth middleware
├── vercel.json              # Cron: /api/cron/trial-emails daily at 9 AM UTC
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## What's Built (everything)

### Core Product
- [x] Photo analysis — upload → AI returns OSHA-cited observations → export PDF/CSV
- [x] Safety Coach — voice + text chat with real-time OSHA citations, auto-logged observations
- [x] Auth — signup, login, forgot/reset password, email confirmation
- [x] Projects + Audits — CRUD, audit history, observation management
- [x] Plan limits — walks/photos/coach sessions enforced per plan
- [x] Stripe payments — checkout, portal, webhook with idempotency

### Scalability & Monitoring
- [x] Upstash Redis — distributed rate limiting + response caching (30s TTL)
- [x] Health endpoint — /api/health checks DB, Redis, env vars
- [x] UptimeRobot — monitoring getvorsa.ai/api/health every 5 min
- [x] Sentry — error tracking (client, server, edge) with session replay on errors
- [x] Vercel Analytics + Speed Insights
- [x] Stripe webhook idempotency — stripe_webhook_events table

### Marketing & Growth
- [x] Marketing landing page — Hero, Features, BeforeAfter, CoachDemo, Pricing, EmailCapture
- [x] SEO blog — 8 articles targeting OSHA/construction safety keywords (static SSG)
- [x] Google structured data — Organization, SoftwareApplication, FAQPage (JSON-LD)
- [x] Sitemap + robots.txt — dynamic, includes all blog posts
- [x] Email drip sequences — welcome, day 3, day 10, trial expired (via Resend)
- [x] Vercel cron — daily at 9 AM UTC for trial email processing
- [x] Conversion funnel tracking — signup, first analysis, coach session, upgrade, export
- [x] Referral program — full stack (code generation, tracking, Stripe credits, /referral page, dashboard)
- [x] Slack signup notifications — pings channel on every new signup
- [x] Marketing content pack — 10 LinkedIn posts, 3 cold email templates, 10 directory listings
- [x] Terms of Service + Privacy Policy
- [x] Watch Demo button — scrolls to CoachDemo section

### Database (Supabase)
- [x] 6 core tables: profiles, projects, audits, observations, coach_sessions, usage_logs
- [x] stripe_webhook_events (migration 004)
- [x] referrals table + profile columns referral_code/referred_by (migration 005)
- [x] Storage bucket: audit-photos (private)
- [x] Indexes optimized for scale

---

## Known Issues / Gotchas
- `.env.local` IS in `.gitignore` — copy manually between machines
- Anthropic client uses `VORSA_ANTHROPIC_KEY` to avoid collision with Claude Code's ANTHROPIC_API_KEY
- Next.js 16 shows warning about `middleware` convention being deprecated (use `proxy`) — works for now
- Rate limiter falls back to in-memory if Redis env vars are not set

---

## CURRENT SESSION

> **Update this section before ending every work session.**

| Field | Value |
|-------|-------|
| Date | 2026-03-16 |
| Location | LAPTOP |
| Last commit | `df0e4bf` — Add Slack notification on new signups |
| Dev server status | Not running (building/pushing) |
| Errors at close | None |

### What was done this session
- **Scalability infrastructure:** Upstash Redis (rate limiting + caching), /api/health endpoint, Stripe webhook idempotency, coach 55s timeout, Cache-Control headers, new DB indexes (migration 004)
- **Upstash Redis created** via API — `vorsa-ai-prod` in us-east-1, env vars set locally + in Vercel
- **Verified production health:** `getvorsa.ai/api/health` returns healthy (DB ok, Redis ok, env ok)
- **UptimeRobot configured** — monitoring /api/health every 5 min
- **Email drip system:** welcome, day 3, day 10, trial expired emails via Resend + cron at 9 AM UTC
- **SEO blog:** 8 articles (OSHA checklist, AI tools, safety walk, top 10 violations, audit template, fall protection, EMR, daily checklist)
- **Google structured data:** Organization, SoftwareApplication, FAQPage JSON-LD
- **Conversion tracking:** Vercel Analytics events for signup, analysis, coach, upgrade, export
- **Referral program:** Full stack — code generation, tracking, Stripe balance credits, /referral page, /settings/referral dashboard, sidebar link, webhook trigger on checkout
- **Slack signup notifications:** pings on every new signup (webhook URL pending)
- **Marketing content pack:** 10 LinkedIn posts, 3 cold email templates, directory listings, referral copy
- **Watch Demo button** fixed — scrolls to CoachDemo
- **Removed placeholder notifications bell** from dashboard header
- **Vercel cron** configured via vercel.json
- **Migration 004 applied** in Supabase (webhook events + indexes)
- All code committed and pushed, Vercel deploying

### What Carlos is doing right now (in Cowork)
1. Setting up Slack Incoming Webhook → will add SLACK_WEBHOOK_URL to Vercel
2. Verifying Resend domain (getvorsa.ai)
3. Starting LinkedIn posting from References/marketing-content.md

### Next steps
1. **Add env vars to Vercel:** CRON_SECRET, SLACK_WEBHOOK_URL, INTERNAL_API_SECRET
2. **Run migration 005** in Supabase SQL Editor (referrals table)
3. **Record 60-second demo video** — upload photo → AI findings → export PDF
4. **List on Capterra and G2** (free — links in References/marketing-content.md)
5. **Cold email batch #1** — target 20 safety managers at GCs
6. **Monitor Vercel Analytics** for conversion funnel data

### Notes
- App is fully deployed and live at getvorsa.ai
- Email confirmation is re-enabled in Supabase
- Stripe webhook points to production URL
- All migrations through 004 applied; 005 (referrals) still pending
- Redis falls back gracefully to in-memory if unavailable

---

## Session Log

| Date | Location | Summary |
|------|----------|---------|
| 2026-03-04 | HOME | Initial scaffolding complete. All pages, components, API routes, hooks, libs, types, SQL migrations written. GitHub repo created + pushed. |
| 2026-03-05 | LAPTOP | Connected all services: Supabase project + migrations, Stripe account + 3 products, Anthropic + Resend keys. |
| 2026-03-10 | LAPTOP | Full E2E testing passed: auth, photo analysis, safety coach. Fixed /signin 404. Removed debug logging. Disabled email confirm for testing. |
| 2026-03-11 | LAPTOP | Rebranded to Vorsa AI. Deployed to Vercel at getvorsa.ai. Added legal pages, SEO files, Vercel Analytics, Sentry. Re-enabled email confirmation. |
| 2026-03-15–16 | LAPTOP | Major growth infrastructure push: Upstash Redis (rate limiting + caching), health endpoint, UptimeRobot, webhook idempotency, email drip system (4 emails + cron), 8 SEO blog articles, structured data, conversion tracking, full referral program (Stripe credits), Slack signup notifications, marketing content pack (LinkedIn + cold emails + directories), Watch Demo fix, removed placeholder notifications bell. All committed and pushed. |
