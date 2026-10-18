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
