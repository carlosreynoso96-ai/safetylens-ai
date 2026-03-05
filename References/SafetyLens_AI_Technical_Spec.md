# SafetyLens AI — Technical Architecture Spec

**Version:** 1.0  
**Date:** March 2026  
**Author:** Carlos / OSO Construction Tech  
**Purpose:** Complete blueprint for building the SafetyLens AI production web application. Hand this to Claude Code or a developer to build from scratch.

---

## 1. Product Overview

SafetyLens AI is a web application with two core features:

1. **SafetyLens Analyze** — Drag-and-drop photo analysis that auto-generates OSHA-cited safety audit observations (narrative, CFR code, severity, corrective action, category) from jobsite photos using AI vision.

2. **SafetyLens Coach** — Real-time voice-based AI safety trainer that guides users through live jobsite walks, identifying what to check trade-by-trade and logging observations automatically.

**Business model:** SaaS, per-user monthly subscriptions with 5 tiers (Free Trial, Starter, Professional, Coach, Enterprise).

---

## 2. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | **Next.js 14+ (App Router)** | Full-stack React, API routes, SSR, Vercel-native |
| Hosting | **Vercel** | Zero-config deploy, edge functions, great DX |
| Database | **Supabase (PostgreSQL)** | Auth, DB, file storage, realtime — all in one |
| Auth | **Supabase Auth** | Email/password, magic link, OAuth (Google) |
| File Storage | **Supabase Storage** | Photo uploads, compressed images, PDF exports |
| Payments | **Stripe** | Checkout, subscriptions, customer portal, webhooks |
| AI | **Anthropic API (Claude Sonnet)** | Vision analysis for photos, conversation for Coach |
| Styling | **Tailwind CSS** | Utility-first, fast iteration |
| Voice | **Web Speech API** | Browser-native STT/TTS for Coach (no extra cost) |
| Email | **Resend** | Transactional emails (welcome, receipts, alerts) |
| Analytics | **PostHog** or **Plausible** | Privacy-friendly product analytics |
| Domain | **safetylens.ai** | Primary domain |

---

## 3. Project Structure

```
safetylens-ai/
├── app/
│   ├── (marketing)/              # Public pages (no auth required)
│   │   ├── page.tsx              # Landing page (hero, features, pricing, CTA)
│   │   ├── pricing/page.tsx      # Dedicated pricing page
│   │   └── layout.tsx            # Marketing layout (nav, footer)
│   │
│   ├── (auth)/                   # Auth pages
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── layout.tsx            # Minimal auth layout
│   │
│   ├── (dashboard)/              # Protected app pages
│   │   ├── layout.tsx            # Dashboard shell (sidebar, header)
│   │   ├── page.tsx              # Dashboard home (recent audits, stats)
│   │   ├── analyze/page.tsx      # Photo analysis tool
│   │   ├── coach/page.tsx        # AI Safety Coach
│   │   ├── audits/
│   │   │   ├── page.tsx          # Audit history list
│   │   │   └── [id]/page.tsx     # Single audit detail view
│   │   ├── projects/
│   │   │   ├── page.tsx          # Project list
│   │   │   └── [id]/page.tsx     # Project detail with audits
│   │   └── settings/
│   │       ├── page.tsx          # Account settings
│   │       ├── billing/page.tsx  # Subscription management
│   │       └── team/page.tsx     # Team management (Enterprise)
│   │
│   ├── api/
│   │   ├── analyze/route.ts      # Photo analysis endpoint
│   │   ├── coach/route.ts        # Coach conversation endpoint
│   │   ├── stripe/
│   │   │   ├── checkout/route.ts # Create checkout session
│   │   │   ├── portal/route.ts   # Customer portal redirect
│   │   │   └── webhook/route.ts  # Stripe webhook handler
│   │   ├── audits/
│   │   │   ├── route.ts          # CRUD audits
│   │   │   └── [id]/
│   │   │       ├── route.ts      # Single audit operations
│   │   │       └── export/route.ts # CSV/PDF export
│   │   └── usage/route.ts        # Check usage limits
│   │
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Tailwind imports + custom styles
│
├── components/
│   ├── ui/                       # Reusable UI primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Dropdown.tsx
│   │   └── Toast.tsx
│   │
│   ├── analyze/                  # Photo analysis components
│   │   ├── PhotoDropZone.tsx      # Drag-and-drop upload area
│   │   ├── PhotoQueue.tsx         # Processing queue with status
│   │   ├── ObservationCard.tsx    # Single observation display/edit
│   │   ├── ObservationList.tsx    # List of all observations
│   │   ├── ComplianceToggle.tsx   # POS/NEG toggle with auto-swap
│   │   ├── CategorySelect.tsx     # Category dropdown (57 categories)
│   │   ├── ExportBar.tsx          # CSV/PDF export buttons
│   │   └── AuditHeader.tsx        # Project name, inspector, date
│   │
│   ├── coach/                    # Coach components
│   │   ├── CoachChat.tsx          # Chat message display
│   │   ├── VoiceButton.tsx        # Push-to-talk mic button
│   │   ├── TextInput.tsx          # Fallback text input
│   │   ├── ObservationLog.tsx     # Side panel observation tracker
│   │   ├── WalkStartScreen.tsx    # Pre-walk start screen
│   │   └── StatusIndicator.tsx    # Listening/speaking/ready badge
│   │
│   ├── dashboard/                # Dashboard components
│   │   ├── Sidebar.tsx
│   │   ├── DashboardHeader.tsx
│   │   ├── RecentAudits.tsx
│   │   ├── StatsCards.tsx
│   │   └── UsageMeter.tsx         # Shows walks used / limit
│   │
│   ├── marketing/                # Landing page components
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── PricingTable.tsx
│   │   ├── BeforeAfter.tsx
│   │   ├── CoachDemo.tsx          # Simulated conversation
│   │   └── EmailCapture.tsx
│   │
│   └── layout/
│       ├── MarketingNav.tsx
│       ├── MarketingFooter.tsx
│       └── AuthGuard.tsx          # Redirect if not authenticated
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server Supabase client
│   │   └── admin.ts              # Service role client (webhooks)
│   │
│   ├── stripe/
│   │   ├── client.ts             # Stripe instance
│   │   ├── plans.ts              # Plan definitions and price IDs
│   │   └── helpers.ts            # Checkout, portal helpers
│   │
│   ├── anthropic/
│   │   ├── client.ts             # Anthropic SDK instance
│   │   ├── analyze.ts            # Photo analysis prompt + processing
│   │   └── coach.ts              # Coach system prompt + conversation
│   │
│   ├── constants/
│   │   ├── categories.ts         # 57 Safety Reports categories
│   │   ├── severity.ts           # Severity levels
│   │   └── plans.ts              # Plan features and limits
│   │
│   └── utils/
│       ├── compress-image.ts     # Client-side image compression
│       ├── export-csv.ts         # CSV generation
│       ├── export-pdf.ts         # PDF generation (html-to-pdf)
│       └── format.ts             # Date, number formatters
│
├── hooks/
│   ├── useAuth.ts                # Auth state hook
│   ├── usePlan.ts                # Current plan + limits
│   ├── useUsage.ts               # Usage tracking hook
│   ├── useSpeechRecognition.ts   # Web Speech API STT hook
│   └── useSpeechSynthesis.ts     # Web Speech API TTS hook
│
├── types/
│   ├── database.ts               # Supabase generated types
│   ├── audit.ts                  # Audit, Observation types
│   ├── coach.ts                  # Coach message types
│   └── plan.ts                   # Plan, subscription types
│
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_rls_policies.sql
│       └── 003_storage_buckets.sql
│
├── public/
│   ├── og-image.png              # Social share image
│   └── favicon.ico
│
├── .env.local                    # Environment variables (never commit)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 4. Database Schema

### Tables

```sql
-- ============================================
-- 001_initial_schema.sql
-- ============================================

-- Users (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company TEXT,
  role TEXT,                       -- 'Safety Director', 'PM', 'Superintendent', etc.
  avatar_url TEXT,
  stripe_customer_id TEXT UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free_trial',  -- free_trial, starter, professional, coach, enterprise
  plan_status TEXT NOT NULL DEFAULT 'trialing', -- trialing, active, past_due, canceled
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  walks_used_this_month INT NOT NULL DEFAULT 0,
  walks_reset_at TIMESTAMPTZ DEFAULT DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,              -- e.g. "Hard Rock Hotel - Guitar Podium"
  location TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audits (a single safety walk session)
CREATE TABLE public.audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  audit_type TEXT NOT NULL DEFAULT 'analyze', -- 'analyze' or 'coach'
  inspector_name TEXT,
  audit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'draft',  -- draft, completed
  total_observations INT NOT NULL DEFAULT 0,
  compliant_count INT NOT NULL DEFAULT 0,
  non_compliant_count INT NOT NULL DEFAULT 0,
  critical_count INT NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Observations (individual findings within an audit)
CREATE TABLE public.observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  
  -- Compliance
  compliance TEXT NOT NULL DEFAULT 'non_compliant', -- 'compliant' or 'non_compliant'
  
  -- AI-generated fields
  category TEXT NOT NULL,
  osha_standard TEXT,
  osha_description TEXT,
  narrative TEXT,
  severity TEXT NOT NULL DEFAULT 'Medium',  -- Low, Medium, High, Critical
  corrective_action TEXT,
  inspection_items TEXT[],         -- Array of inspection item codes
  
  -- Both versions for toggle
  compliant_narrative TEXT,
  compliant_corrective_action TEXT,
  non_compliant_narrative TEXT,
  non_compliant_corrective_action TEXT,
  severity_if_compliant TEXT DEFAULT 'Low',
  severity_if_non_compliant TEXT DEFAULT 'Medium',
  
  -- Photo
  photo_url TEXT,                  -- Supabase storage URL
  photo_thumbnail_url TEXT,        -- Compressed thumbnail
  original_filename TEXT,
  
  -- Source
  source TEXT NOT NULL DEFAULT 'analyze', -- 'analyze' (photo) or 'coach' (voice)
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Coach Sessions (conversation history for coach walks)
CREATE TABLE public.coach_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',  -- Full conversation history
  area TEXT,                       -- "Level 3, Guitar Podium"
  trades_active TEXT[],            -- ["Hot Work", "Steel Erection"]
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Usage tracking (monthly)
CREATE TABLE public.usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,            -- 'analyze_walk', 'coach_walk', 'photo_analyzed'
  audit_id UUID REFERENCES public.audits(id),
  metadata JSONB,                  -- Additional context
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audits_user ON public.audits(user_id, created_at DESC);
CREATE INDEX idx_audits_project ON public.audits(project_id);
CREATE INDEX idx_observations_audit ON public.observations(audit_id, sort_order);
CREATE INDEX idx_usage_user_month ON public.usage_logs(user_id, created_at);
CREATE INDEX idx_profiles_stripe ON public.profiles(stripe_customer_id);
```

### Row Level Security

```sql
-- ============================================
-- 002_rls_policies.sql
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/update their own
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Projects: users can CRUD their own
CREATE POLICY "Users can CRUD own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);

-- Audits: users can CRUD their own
CREATE POLICY "Users can CRUD own audits" ON public.audits FOR ALL USING (auth.uid() = user_id);

-- Observations: users can CRUD their own
CREATE POLICY "Users can CRUD own observations" ON public.observations FOR ALL USING (auth.uid() = user_id);

-- Coach sessions: users can CRUD their own
CREATE POLICY "Users can CRUD own coach sessions" ON public.coach_sessions FOR ALL USING (auth.uid() = user_id);

-- Usage logs: users can read their own
CREATE POLICY "Users can read own usage" ON public.usage_logs FOR SELECT USING (auth.uid() = user_id);
```

### Storage

```sql
-- ============================================
-- 003_storage_buckets.sql
-- ============================================

-- Create bucket for audit photos
INSERT INTO storage.buckets (id, name, public) VALUES ('audit-photos', 'audit-photos', false);

-- Policy: users can upload to their own folder
CREATE POLICY "Users can upload own photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'audit-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: users can view their own photos
CREATE POLICY "Users can view own photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'audit-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: users can delete their own photos
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'audit-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 5. Plan Definitions & Limits

```typescript
// lib/constants/plans.ts

export const PLANS = {
  free_trial: {
    name: 'Free Trial',
    price: 0,
    duration: '14 days',
    stripe_price_id: null,
    limits: {
      walks_per_month: 5,
      photos_per_walk: 50,
      coach_enabled: true,        // Limited — 2 coach sessions
      coach_sessions_per_month: 2,
      export_csv: true,
      export_pdf: true,
      custom_templates: false,
      audit_history: true,        // Last 30 days only
      team_members: 1,
    }
  },
  starter: {
    name: 'Starter',
    price: 29,
    stripe_price_id: 'price_STARTER_ID', // Replace with actual Stripe price ID
    limits: {
      walks_per_month: 20,
      photos_per_walk: 100,
      coach_enabled: false,
      coach_sessions_per_month: 0,
      export_csv: true,
      export_pdf: true,
      custom_templates: false,
      audit_history: true,        // Full history
      team_members: 1,
    }
  },
  professional: {
    name: 'Professional',
    price: 49,
    stripe_price_id: 'price_PRO_ID',
    limits: {
      walks_per_month: -1,        // Unlimited
      photos_per_walk: 200,
      coach_enabled: false,
      coach_sessions_per_month: 0,
      export_csv: true,
      export_pdf: true,
      custom_templates: true,
      audit_history: true,
      team_members: 1,
    }
  },
  coach: {
    name: 'Coach',
    price: 89,
    stripe_price_id: 'price_COACH_ID',
    limits: {
      walks_per_month: -1,        // Unlimited
      photos_per_walk: 200,
      coach_enabled: true,
      coach_sessions_per_month: -1, // Unlimited
      export_csv: true,
      export_pdf: true,
      custom_templates: true,
      audit_history: true,
      team_members: 1,
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: null,                  // Custom
    stripe_price_id: null,
    limits: {
      walks_per_month: -1,
      photos_per_walk: 500,
      coach_enabled: true,
      coach_sessions_per_month: -1,
      export_csv: true,
      export_pdf: true,
      custom_templates: true,
      audit_history: true,
      team_members: -1,           // Unlimited
    }
  },
} as const;
```

---

## 6. API Routes Spec

### POST /api/analyze

Receives a base64 image, sends to Claude Sonnet for analysis, returns structured observation.

```typescript
// Request
{
  image_base64: string,          // Compressed JPEG base64
  audit_id: string,              // UUID of the audit this belongs to
}

// Response
{
  observation: {
    best_guess: 'compliant' | 'non_compliant',
    category: string,
    osha_standard: string,
    osha_description: string,
    severity_if_compliant: string,
    severity_if_non_compliant: string,
    compliant_narrative: string,
    compliant_corrective_action: string,
    non_compliant_narrative: string,
    non_compliant_corrective_action: string,
    inspection_items: string[],
  }
}
```

Server-side logic:
1. Verify auth (Supabase session)
2. Check usage limits (walks remaining, plan features)
3. Call Anthropic API with the system prompt from our prototype
4. Parse response, save observation to database
5. Upload photo to Supabase Storage
6. Return observation data

### POST /api/coach

Sends conversation history to Claude, returns coach response + any extracted observations.

```typescript
// Request
{
  messages: Array<{ role: 'user' | 'assistant', content: string }>,
  session_id: string,
}

// Response
{
  reply: string,                  // Spoken text (no [OBS] tags)
  observation?: {                 // Extracted observation if present
    compliance: string,
    category: string,
    osha_standard: string,
    description: string,
    severity: string,
  }
}
```

Server-side logic:
1. Verify auth + check Coach plan access
2. Call Anthropic API with Coach system prompt
3. Parse response — extract [OBS] blocks if present
4. Save conversation to coach_sessions table
5. Save any observations to observations table
6. Return clean reply text + observation data

### POST /api/stripe/checkout

Creates a Stripe Checkout session for the selected plan.

```typescript
// Request
{ plan: 'starter' | 'professional' | 'coach' }

// Response
{ checkout_url: string }
```

### POST /api/stripe/webhook

Handles Stripe events. Key events:
- `checkout.session.completed` → Create/update profile with plan
- `customer.subscription.updated` → Update plan status
- `customer.subscription.deleted` → Downgrade to free
- `invoice.payment_failed` → Set status to 'past_due'

### GET /api/audits

Returns paginated audit list for the authenticated user.

```typescript
// Query params: ?page=1&limit=20&project_id=xxx

// Response
{
  audits: Array<Audit>,
  total: number,
  page: number,
}
```

### GET /api/audits/[id]/export

Generates CSV or PDF export of an audit.

```typescript
// Query params: ?format=csv or ?format=pdf

// Response: File download
```

### GET /api/usage

Returns current month's usage stats.

```typescript
// Response
{
  walks_used: number,
  walks_limit: number,            // -1 for unlimited
  photos_analyzed: number,
  coach_sessions_used: number,
  coach_sessions_limit: number,
  plan: string,
  trial_ends_at: string | null,
}
```

---

## 7. AI Prompts

### Photo Analysis System Prompt

```
You are an expert OSHA construction safety inspector. You analyze construction site photos and provide detailed safety audit observations.

For each photo, you must determine:
1. Whether the photo MOST LIKELY shows a COMPLIANT (positive) or NON-COMPLIANT (negative) condition
2. The most appropriate category from the Safety Reports Inspection app categories
3. The specific OSHA standard reference (e.g., 29 CFR 1926.501(b)(1))
4. Severity level (Low, Medium, High, Critical)
5. BOTH a compliant AND non-compliant version of the narrative and corrective action

Your "best_guess" field should be your honest assessment of what the photo shows.

IMPORTANT: Be specific with OSHA references. Use the exact CFR citation. For DOT items, use FMCSA references.

Respond ONLY with a JSON object (no markdown, no backticks, no preamble) with these exact fields:
{
  "best_guess": "compliant" or "non_compliant",
  "category": "one of the Safety Reports categories",
  "osha_standard": "Specific OSHA/CFR reference",
  "osha_description": "Brief description of the standard requirement",
  "severity_if_compliant": "Low",
  "severity_if_non_compliant": "Low|Medium|High|Critical",
  "compliant_narrative": "Professional narrative describing the POSITIVE observation",
  "compliant_corrective_action": "Positive recognition note",
  "non_compliant_narrative": "Professional narrative describing the NEGATIVE observation",
  "non_compliant_corrective_action": "Specific corrective action required",
  "inspection_items": ["List of specific inspection item codes if applicable"]
}
```

### Coach System Prompt

```
You are an expert OSHA construction safety trainer walking alongside someone on a live jobsite safety audit. You are their coach — experienced, approachable, and sharp.

PERSONALITY:
- Talk like a seasoned safety professional, not a textbook. Use construction language.
- Be conversational. Keep responses to 2-4 sentences max. You're talking, not lecturing.
- Ask ONE follow-up question at a time. Never dump a full checklist.
- Acknowledge what they're doing right before flagging issues.
- Build on context from the conversation.
- Use specific OSHA CFR citations naturally.

FLOW:
1. Ask what area/level and what trades are active
2. Guide them to highest-priority items first
3. Walk through observations one at a time
4. Track observations internally
5. Wrap up with debrief

OBSERVATION LOGGING:
When the user describes a clear safety observation, include at the END:
[OBS]{"compliance":"compliant|non_compliant","category":"...","osha_standard":"...","description":"...","severity":"Low|Medium|High|Critical"}[/OBS]

Only include when there's a clear observation. Text before [OBS] is spoken aloud.

IMPORTANT:
- Keep responses SHORT. Spoken on a jobsite.
- Never say "As an AI." You are their safety coach.
- Match their energy.
```

---

## 8. Key User Flows

### Flow 1: New User Signup → First Audit

1. User lands on safetylens.ai
2. Clicks "Get Early Access" or "Start Free Trial"
3. Signup form: email, password, full name, company (optional)
4. Email verification (Supabase magic link)
5. Redirect to /dashboard — onboarding modal:
   - "Create your first project" (name, location)
   - "Start your first audit" → redirect to /analyze
6. Photo analysis tool loads with project pre-selected
7. User drags photos → AI processes sequentially
8. User reviews, toggles POS/NEG, edits
9. User exports CSV or PDF
10. Audit saved to dashboard

### Flow 2: Coach Walk Session

1. User navigates to /coach
2. Clicks "Start Safety Walk"
3. Selects project from dropdown (or creates new)
4. Coach greets them, asks about area and trades
5. User holds mic and talks (or types)
6. Coach responds via voice + text
7. Observations auto-logged in side panel
8. User clicks "End Walk"
9. Coach provides debrief summary
10. All observations saved to audit record
11. User can export or edit observations

### Flow 3: Upgrade to Paid Plan

1. User hits plan limit (e.g., 5 walks on free trial)
2. Modal: "You've reached your free trial limit. Upgrade to continue."
3. User selects plan → Stripe Checkout
4. Stripe processes payment
5. Webhook fires → updates profile plan + status
6. User redirected back to app with upgraded access

### Flow 4: Returning User Dashboard

1. User logs in → /dashboard
2. Sees: recent audits, stats (this month's walks, observations, compliance rate)
3. Usage meter shows walks used / limit
4. Quick actions: "New Audit Walk" or "Start Coach Session"
5. Project selector filters audits by project
6. Click any audit to view full detail with observations

---

## 9. Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PROFESSIONAL=price_...
STRIPE_PRICE_COACH=price_...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Resend (email)
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=https://safetylens.ai
```

---

## 10. Stripe Setup

### Products to Create in Stripe Dashboard

1. **SafetyLens Starter** — $29/month, per seat
2. **SafetyLens Professional** — $49/month, per seat
3. **SafetyLens Coach** — $89/month, per seat

### Webhook Events to Listen For

```
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.payment_succeeded
invoice.payment_failed
```

### Customer Portal

Enable Stripe Customer Portal for self-service:
- Plan changes (upgrade/downgrade)
- Payment method updates
- Invoice history
- Cancellation

---

## 11. Deployment Checklist

### Vercel Setup
1. Connect GitHub repo to Vercel
2. Set all environment variables in Vercel dashboard
3. Add custom domain: safetylens.ai
4. Enable Vercel Analytics (optional)

### Supabase Setup
1. Create new Supabase project
2. Run migration SQL files in order
3. Configure auth: enable email/password + Google OAuth
4. Create storage bucket "audit-photos"
5. Set up email templates (confirm signup, password reset)

### Stripe Setup
1. Create products and prices
2. Set up webhook endpoint: https://safetylens.ai/api/stripe/webhook
3. Enable Customer Portal
4. Test with Stripe test mode first

### DNS
1. Purchase safetylens.ai
2. Point to Vercel (CNAME or A records)
3. SSL auto-provisioned by Vercel

### Pre-Launch
- [ ] Test full signup → analyze → export flow
- [ ] Test Coach voice flow on mobile (Chrome)
- [ ] Test Stripe checkout → webhook → plan update
- [ ] Test plan limits and upgrade flow
- [ ] Test CSV and PDF exports
- [ ] Mobile responsive check (all pages)
- [ ] SEO meta tags on all marketing pages
- [ ] OG image for social sharing
- [ ] Error handling for all API routes
- [ ] Rate limiting on API routes (Vercel edge middleware)
- [ ] 404 and error pages

---

## 12. Categories Reference

The 57 Safety Reports Inspection categories (used in CategorySelect.tsx and AI prompts):

Administrative, Asbestos, Behaviors, Concrete Masonry, Confined Space, Cranes, Demolition, Electrical Safety, Emergency Action Plan, Exits/Egress, Fall Protection, Fire Safety, Forklifts, Fueling Operations, Hazard Communication, Health Hazards, Heat Illness Prevention, Housekeeping, Infection Control, Ladders/Stairs, Laser Safety, Mechanized Equipment, Medical/FA Services, MEWPS Group B Aerial Boom Lifts, MEWPs Group A Scissor Lifts, Overhead Hoists, Pile Driving, PPE, Postings/Safety Signs, Public Protection, Recordkeeping, Respiratory Protection, Rigging, Safety Training, Sanitation, Scaffolds - Rolling Baker, Scaffolds - Supported, Scaffolds - Suspension, Scaffolds - Master Climber, Scaffolds - Pump Jack, Scaffolds - Stair Tower, Silica Exposure, Steel Erection, Stilt Safety, Storage and Disposal, Stormwater Management, Temporary Heating Devices, Tools (Hand and Power), Tools (Powder Actuated), Traffic Control, Traffic Control (Flaggers), Trenching/Excavation, Trucks/Pickups/Autos, Trucker/Trailer Combos DOT, Welding and Cutting (Hot Work), Working Over Water, Other/Misc.

---

## 13. Build Order (Recommended)

For Claude Code, build in this order to have a working app at each stage:

**Phase 1 — Foundation (Day 1-2)**
1. Initialize Next.js project with Tailwind
2. Set up Supabase client and run migrations
3. Build auth pages (signup, login, forgot password)
4. Build dashboard layout shell (sidebar, header)
5. Build profile creation trigger (on signup)

**Phase 2 — Photo Analysis Core (Day 3-5)**
6. Build PhotoDropZone component
7. Build /api/analyze route (Anthropic integration)
8. Build image compression utility
9. Build ObservationCard with edit mode
10. Build ComplianceToggle with narrative swap
11. Build ExportBar (CSV + PDF)
12. Build /analyze page assembling all components
13. Save audits + observations to Supabase

**Phase 3 — Dashboard (Day 6-7)**
14. Build dashboard home with recent audits + stats
15. Build audit detail view
16. Build project CRUD
17. Build usage tracking

**Phase 4 — Billing (Day 8-9)**
18. Set up Stripe products and prices
19. Build checkout API route
20. Build webhook handler
21. Build billing settings page with Customer Portal
22. Build plan limit enforcement (middleware)
23. Build upgrade prompts when limits hit

**Phase 5 — Coach (Day 10-12)**
24. Build Coach chat UI
25. Build /api/coach route
26. Build voice input (useSpeechRecognition hook)
27. Build voice output (useSpeechSynthesis hook)
28. Build observation auto-logging from [OBS] tags
29. Build ObservationLog side panel
30. Build coach session saving
31. Connect Coach observations to audit record

**Phase 6 — Landing Page & Launch (Day 13-14)**
32. Build marketing landing page (port from prototype)
33. Build pricing page
34. SEO, OG tags, meta
35. Mobile responsive pass
36. Final testing
37. Deploy to production

---

## 14. Notes for Claude Code

- **Always use server-side API routes for Anthropic calls.** Never expose the API key client-side. The prototype used client-side calls (for artifact demo purposes) — production must proxy through /api/analyze and /api/coach.
- **Image compression happens client-side** before upload to reduce bandwidth. Max 1200px, JPEG quality 0.7.
- **Sequential photo processing** — process one photo at a time with 1.5s delay between API calls to avoid rate limits. Show queue progress.
- **The Coach voice flow** depends on Web Speech API which requires HTTPS and works in Chrome/Edge. Always provide text input fallback.
- **Supabase realtime** is available but not needed for MVP. Could be used later for team collaboration features.
- **The [OBS] tag extraction** happens server-side in /api/coach — strip tags before returning the spoken text to the client.
- **PDF export** — use a print-window approach (like the prototype) for MVP. Upgrade to a proper PDF library (like @react-pdf/renderer or puppeteer) later.
- **Mobile-first for Coach** — the Coach will primarily be used on phones on jobsites. Ensure the mic button is large and accessible, and the UI works well on small screens.

---

*SafetyLens AI — Built by construction professionals, for construction professionals.*
*OSO Construction Tech | OSO Design & Construction LLC*
