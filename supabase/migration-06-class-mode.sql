-- Class mode (spec section 6): a teacher starts a live round on one line's
-- pre/post question bank, students join with a room code, live leaderboard
-- scored on accuracy then speed. Deliberately no student login required —
-- a classroom guest joins with just a display name, so this stays usable
-- for students who haven't made an account yet. host_token authorizes
-- starting/ending a round without a full teacher account system: it's
-- generated at room creation and shown only to whoever created it.
--
-- Additive. Run once in the Supabase SQL editor, after migration-05.

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
  id            uuid primary key default gen_random_uuid(),
  room_id       uuid not null references public.class_rooms (id) on delete cascade,
  display_name  text not null,
  score         integer not null default 0,
  total_ms      integer,
  submitted_at  timestamptz,
  joined_at     timestamptz not null default now()
);

create index if not exists class_participants_room_idx
  on public.class_participants (room_id, score desc, total_ms asc);

alter table public.class_rooms        enable row level security;
alter table public.class_participants enable row level security;
