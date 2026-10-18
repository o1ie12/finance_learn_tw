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
