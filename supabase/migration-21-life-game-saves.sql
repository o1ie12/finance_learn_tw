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
