-- 起薪線 — database schema (Supabase / Postgres)
-- Run this in the Supabase SQL editor for a new project.
--
-- Only the server (service role key) ever touches these tables, so RLS is
-- enabled with no policies: the anon/public key can read nothing, while the
-- service role bypasses RLS. Do not expose the service role key to the client.

create extension if not exists "pgcrypto";

-- students -----------------------------------------------------------------
-- One logical account per real user. access_code (the original code-based
-- sign-in) and google_uid (Supabase Auth's stable id for a linked Google
-- identity) are independent, optional auth methods on the same row — a
-- student can have either, or both. At least one must be present.
create table if not exists public.students (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  school       text not null,
  grade        text not null,
  access_code  text unique,
  google_uid   text unique,
  google_email text,
  points_total integer not null default 0,
  created_at   timestamptz not null default now(),
  constraint students_has_auth_method
    check (access_code is not null or google_uid is not null)
);

-- module_progress ----------------------------------------------------------
create table if not exists public.module_progress (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references public.students (id) on delete cascade,
  module_number integer not null check (module_number between 1 and 50),
  completed_at  timestamptz,
  quiz_score    integer not null default 0,
  quiz_total    integer not null default 0,
  unique (student_id, module_number)
);

create index if not exists module_progress_student_idx
  on public.module_progress (student_id);

-- simulation_runs ----------------------------------------------------------
-- One row per terminal-simulation run. line_slug says which line it belongs to
-- ('qixin' | 'cunqian' | 'xinyong' | 'touzi'). rent_choice / savings_rate are
-- specific to the First Salary sim (qixin); other lines leave them null and
-- store their inputs/outcome in the jsonb columns.
create table if not exists public.simulation_runs (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references public.students (id) on delete cascade,
  line_slug        text not null default 'qixin',
  rent_choice      text,
  savings_rate     integer,
  spending_choices jsonb not null default '{}'::jsonb,
  outcome_summary  jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now()
);

create index if not exists simulation_runs_student_line_idx
  on public.simulation_runs (student_id, line_slug, created_at desc);

-- coach_messages -----------------------------------------------------------
create table if not exists public.coach_messages (
  id                 uuid primary key default gen_random_uuid(),
  simulation_run_id  uuid not null references public.simulation_runs (id) on delete cascade,
  message            text not null,
  created_at         timestamptz not null default now()
);

create index if not exists coach_messages_run_idx
  on public.coach_messages (simulation_run_id, created_at desc);

-- line_tests -----------------------------------------------------------
-- 前後測 (pre/post line tests). One row per attempt — a student can retake
-- either phase, so the app reads the most recent row per (student, line,
-- phase) rather than assuming uniqueness.
create table if not exists public.line_tests (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  line_slug  text not null,
  phase      text not null check (phase in ('pre', 'post')),
  score      integer not null default 0,
  total      integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists line_tests_student_line_idx
  on public.line_tests (student_id, line_slug, phase, created_at desc);

-- class_rooms / class_participants ------------------------------------------
-- Class mode: a teacher starts a live round on one line's pre/post question
-- bank, students join with a room code, no student login required.
-- host_token authorizes starting/ending a round — generated at room
-- creation and shown only to whoever created it.
create table if not exists public.class_rooms (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique,
  host_token text not null,
  line_slug  text not null,
  status     text not null default 'waiting' check (status in ('waiting', 'active', 'finished')),
  started_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.class_participants (
  id           uuid primary key default gen_random_uuid(),
  room_id      uuid not null references public.class_rooms (id) on delete cascade,
  display_name text not null,
  score        integer not null default 0,
  total_ms     integer,
  submitted_at timestamptz,
  joined_at    timestamptz not null default now()
);

create index if not exists class_participants_room_idx
  on public.class_participants (room_id, score desc, total_ms asc);

-- historical_prices / sim_portfolios -----------------------------------
-- 2b. Historical replay investing simulator. historical_prices is seeded
-- ONCE from real historical data (TWSE/TPEx, licensed open-government-data
-- terms) — static, no ongoing fetch; see lib/historicalPricesSeed.ts.
-- sim_portfolios holds one silently-assigned portfolio per student;
-- sim_start_date is never shown to the student until reveal.
create table if not exists public.historical_prices (
  ticker        text not null,
  date          date not null,
  closing_price numeric not null,
  primary key (ticker, date)
);

create index if not exists historical_prices_ticker_date_idx
  on public.historical_prices (ticker, date);

create table if not exists public.sim_portfolios (
  student_id       uuid primary key references public.students (id) on delete cascade,
  sim_start_date   date not null,
  sim_current_date date not null,
  holdings         jsonb not null default '{}'::jsonb,
  cash_balance     numeric not null default 0,
  last_advanced_at timestamptz not null default now(),
  revealed         boolean not null default false,
  created_at       timestamptz not null default now()
);

-- Lock down: enable RLS with no policies. Service role bypasses RLS; the
-- anon key gets no access at all.
alter table public.students           enable row level security;
alter table public.module_progress    enable row level security;
alter table public.simulation_runs    enable row level security;
alter table public.coach_messages     enable row level security;
alter table public.line_tests         enable row level security;
alter table public.class_rooms        enable row level security;
alter table public.class_participants enable row level security;
alter table public.historical_prices  enable row level security;
alter table public.sim_portfolios     enable row level security;
