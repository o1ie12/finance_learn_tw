-- 起薪線 — database schema (Supabase / Postgres)
-- Run this in the Supabase SQL editor for a new project.
--
-- Only the server (service role key) ever touches these tables, so RLS is
-- enabled with no policies: the anon/public key can read nothing, while the
-- service role bypasses RLS. Do not expose the service role key to the client.

create extension if not exists "pgcrypto";

-- students -----------------------------------------------------------------
create table if not exists public.students (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  school       text not null,
  grade        text not null,
  access_code  text not null unique,
  points_total integer not null default 0,
  created_at   timestamptz not null default now()
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

-- Lock down: enable RLS with no policies. Service role bypasses RLS; the
-- anon key gets no access at all.
alter table public.students        enable row level security;
alter table public.module_progress enable row level security;
alter table public.simulation_runs enable row level security;
alter table public.coach_messages  enable row level security;
