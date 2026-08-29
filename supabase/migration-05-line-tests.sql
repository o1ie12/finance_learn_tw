-- 前後測 (pre/post line tests, spec section 6). One row per attempt — a
-- student can retake either phase, so the app reads the most recent row per
-- (student, line, phase) rather than assuming uniqueness. The score delta
-- between a line's latest 'pre' and latest 'post' row is the platform's
-- aggregate evidence of learning gain.
--
-- Additive. Run once in the Supabase SQL editor, after migration-04.

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

alter table public.line_tests enable row level security;
