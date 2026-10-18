-- Finline redesign: migrations 21-26 in one file, for the Supabase SQL editor.
-- Generated from supabase/migration-21..26 (those files stay the source of truth).
-- All additive; safe to run before the deploy; safe to re-run (if not exists).
-- Requires migrations 1-20 (production already has them).

-- ===== supabase/migration-21-life-game-saves.sql =====
-- 人生賽局 saves (02-LIFE-GAME §2). Additive: a new table nothing reads yet.
--
-- One solo save per student, and one save per class team. A team save's
-- student_id is the member who started it (the captain); any joined member of
-- that team may advance it. class_team_id is `${class_rooms.id}:${team}`, text
-- rather than a foreign key so a team needs no table of its own.
--
-- state is the engine's LifeState (lib/lifeGame/types.ts, STATE_VERSION 1).
-- updated_at is written by the app on every save and doubles as the
-- optimistic-concurrency token: an update names the updated_at it read, and
-- matches nothing if someone else saved in between.
--
-- Same lock-down as every other table: RLS on, no policies. Only the server
-- (service role, which bypasses RLS) touches it.
--
-- Safe to apply before deploying the code that uses it. Idempotent.

begin;

create table if not exists public.life_game_saves (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  class_team_id text null,
  state jsonb not null,
  state_version int not null default 1,
  seed bigint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- one solo save per student
create unique index if not exists life_game_saves_solo
  on public.life_game_saves (student_id) where class_team_id is null;
-- one save per class team
create unique index if not exists life_game_saves_team
  on public.life_game_saves (class_team_id) where class_team_id is not null;

alter table public.life_game_saves enable row level security;

commit;

-- ===== supabase/migration-22-student-avatar.sql =====
-- The character the student builds at onboarding (Stage G, 01 §6.2-6.3).
-- Avatar parts are stored as JSON on the student; null means not built yet,
-- which is every existing row. Additive and nullable: no backfill, no rewrite.
--
-- Safe to apply before deploying the code that uses it. Idempotent.

begin;
alter table public.students add column if not exists avatar jsonb null;
commit;

-- ===== supabase/migration-23-daily-activity.sql =====
-- Streak (02-LIFE-GAME §7.3, Stage K). One row per student per day with at
-- least one action: a completed station task or a completed life-game turn.
-- day is the calendar day in Asia/Taipei, computed by the app. Streak =
-- consecutive days with actions > 0 ending today or yesterday.
--
-- Additive: a new table nothing reads yet. RLS on, no policies, like every
-- other table. Safe to apply before deploy. Idempotent.

begin;

create table if not exists public.daily_activity (
  student_id uuid not null references public.students(id) on delete cascade,
  day date not null,
  actions int not null default 0,
  primary key (student_id, day)
);

alter table public.daily_activity enable row level security;

commit;

-- ===== supabase/migration-24-task-results.sql =====
-- Task-engine results (03-TASK-ENGINE, plan §2). One row per submitted task
-- set attempt; the full TaskResult (steps, answers, reveal shown) is kept in
-- result. Whether the station counts as done still lands in module_progress
-- and line_completions exactly as today; this table is the detail behind it
-- and the attempt counter (done at score >= pass, or on the second attempt).
--
-- line_slug follows migration-16 / migration-20: a foreign key to lines.slug
-- that follows a rename and refuses to orphan rows.
--
-- Additive: a new table nothing reads yet. RLS on, no policies. Safe to apply
-- before deploy. Idempotent.

begin;

create table if not exists public.task_results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  line_slug text not null references public.lines(slug) on update cascade on delete restrict,
  station_id int null,
  task_set_id text not null,
  kind text not null,
  score numeric not null,
  total int not null,
  attempt int not null default 1,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists task_results_student_task_set_idx
  on public.task_results (student_id, task_set_id);

alter table public.task_results enable row level security;

commit;

-- ===== supabase/migration-25-class-life-rooms.sql =====
-- Class 人生賽局 rounds (02-LIFE-GAME §8). A teacher's room is now either the
-- existing pre/post quiz ('quiz', the default, so every existing room and
-- every existing insert stays a quiz) or a life-game round ('life'). A life
-- room carries the shared seed every team plays, and each participant joins
-- a team.
--
-- class_rooms.line_slug stays NOT NULL with its foreign key (migration-06 /
-- migration-16) untouched. A life room is not a line, so the app writes the
-- capstone line, 'caiwujuece' (財務決策線, the line whose finale reads the
-- life-game state), as its line_slug. Readers must branch on kind, never on
-- line_slug, to tell a life room from a quiz.
--
-- Additive. Each new column is nullable or has a constant default, which
-- Postgres 11+ records in the catalog without rewriting the table. Safe to
-- apply before deploying the code that uses it. Idempotent.

begin;

alter table public.class_rooms
  add column if not exists kind text not null default 'quiz'
    constraint class_rooms_kind_check check (kind in ('quiz', 'life'));
alter table public.class_rooms
  add column if not exists seed bigint null;
alter table public.class_participants
  add column if not exists team text null;

commit;

-- ===== supabase/migration-26-line-completions-rls.sql =====
-- Migration 26: enable row level security on line_completions.
--
-- Every table in this project has RLS enabled with no policies, so only the
-- service role (which the app's server uses) can read or write it; the anon
-- key gets nothing through PostgREST. Migration 20 created line_completions
-- without the `enable row level security` line, so it was the one table the
-- anon key could read. This closes that gap. The app is unaffected: the
-- service role bypasses RLS.
--
-- Additive and safe to apply at any time, before or after a deploy.

alter table public.line_completions enable row level security;

