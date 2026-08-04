# 起薪線 · First Salary Line

A free personal-finance course and simulation for Taiwanese high-school
students, in Traditional Chinese. Five article-based modules (each ending in a
short quiz), one interactive **First Salary Simulation**, an **AI coach** that
reacts to the student's simulation choices, and a **progress dashboard** pulled
by a lightweight access code — all themed around the Taipei Metro.

The content is deliberately grounded in **Taiwan's** rules (mobile payments,
the 6% Labor Pension contribution, National Health Insurance, JCIC vs. a FICO
score, and the 0.3% securities transaction tax instead of a capital-gains tax),
not a translation of US material.

## Tech stack

- **Next.js (App Router) + TypeScript**, deployed on Vercel
- **Tailwind CSS v4** (CSS-first theme; Taipei Metro line colors)
- **Supabase (Postgres)** for storage — reached only from server-side API routes
- **Anthropic API (Claude Haiku)** for the coach — called only from `/api/coach`

The browser never talks to Supabase or Anthropic directly; the service-role key
and the Anthropic key stay on the server as environment variables.

## Getting started

### 1. Install

```bash
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. In the project's **SQL Editor**, run [`supabase/schema.sql`](supabase/schema.sql)
   to create the four tables (`students`, `module_progress`, `simulation_runs`,
   `coach_messages`). Row Level Security is enabled with no policies, so the
   anon key can read nothing and only the service role (the server) has access.
3. From **Project Settings → API**, copy the **Project URL** and the
   **service_role** key.

### 3. Get an Anthropic API key

Create one at [console.anthropic.com](https://console.anthropic.com). The coach
uses the `claude-haiku-4-5` model.

### 4. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
ANTHROPIC_API_KEY=...
# optional, for correct metadata/OG URLs in production:
# NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

`.env.local` is gitignored — never commit real keys.

### 5. Run

```bash
npm run dev
```

Open http://localhost:3000.

> **Local testing without credentials.** If you just want to click through the
> app before wiring up Supabase/Anthropic, set `USE_DEV_STORE=1` in `.env.local`.
> In development only, this runs the full flow against a gitignored
> `.devstore.json` file and returns a grounded (non-AI) coach message. It is
> ignored in production — deployments always use Supabase and the real Haiku
> call. Remove the flag (or set real credentials) for the production behavior.

## Deploy to Vercel

1. Push this repo to GitHub (see below).
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Add the three environment variables (`SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`) and optionally
   `NEXT_PUBLIC_SITE_URL`.
4. Deploy. `npm run build` runs a strict type-check and prerenders the static
   and SSG pages.

## Routes

| Route | What it is |
|---|---|
| `/` | Landing page |
| `/signup` | Create a student + generate the access code (also resume by code) |
| `/course` | The five stations (transit map) |
| `/course/[1..5]` | The five lessons + quizzes |
| `/simulation` | The First Salary Simulation (needs a session) |
| `/dashboard` | Progress + simulation result + coach feedback, pulled by access code |
| `/api/signup`, `/api/session`, `/api/progress`, `/api/simulation`, `/api/coach` | Server-side API routes |

## Auth model

No passwords, no email. Sign-up generates a short access code (6 chars,
unambiguous alphabet) stored in an httpOnly cookie. On another device, a student
types the code in to pick up their progress. Suitable for a pilot with a known
group of students.

## Notes

- Lighthouse (mobile) targets are met on every major page: **≥98 Performance,
  100 Accessibility, 100 Best Practices, 100 SEO**.
- Every page works at 360px width first, then scales up.
- No real names beyond a nickname, no phone numbers, no financial account data
  is ever collected.
