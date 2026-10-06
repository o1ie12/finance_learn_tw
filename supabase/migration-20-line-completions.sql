-- Completion is earned once and kept.
--
-- Line completion used to be computed live from the stations a line requires
-- today. Adding a station to a line (station 42, 新聞站, on 投資線) therefore
-- took completion — and the certificate, the route-map count and the line
-- page's 已完成 — away from students who had already finished it. This table
-- records the moment a student completes a line. The app treats a line as
-- complete if it is complete now OR a row exists here, so stations added later
-- never take back what was earned.
--
-- Backfill: a student gets a row only if they met the line's requirement as it
-- stood BEFORE station 42 was attached, in their current mode (NULL mode is
-- sim_first, the app's default): every required station completed, plus a
-- simulation run on the line. That is exactly what the app showed as complete
-- before this change, so nobody is marked complete who was not. The required
-- sets below are generated from lib/lines.ts + lib/modeModel.ts with 42
-- excluded.
--
-- Apply BEFORE deploying the code that adds station 42 to the required set.
-- Idempotent (on conflict do nothing). Do not re-run it after that deploy: a
-- student who then finishes 5 and 8 but not 42 in full mode has NOT completed
-- 投資線 under the new set, and a re-run would mark them complete.

begin;

create table if not exists public.line_completions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  line_slug text not null references public.lines(slug) on update cascade on delete restrict,
  completed_at timestamptz not null default now(),
  unique (student_id, line_slug)
);

create index if not exists line_completions_student_idx
  on public.line_completions (student_id);

with required(line_slug, mode, module_number) as (
  values
    ('zhiya','sim_first',39),
    ('zhiya','sim_first',40),
    ('zhiya','full',39),
    ('zhiya','full',40),
    ('cunqian','sim_first',3),
    ('cunqian','sim_first',6),
    ('cunqian','full',3),
    ('cunqian','full',6),
    ('qixin','sim_first',1),
    ('qixin','sim_first',2),
    ('qixin','full',1),
    ('qixin','full',2),
    ('xinyong','sim_first',4),
    ('xinyong','sim_first',7),
    ('xinyong','full',4),
    ('xinyong','full',7),
    ('touzi','sim_first',5),
    ('touzi','sim_first',8),
    ('touzi','full',5),
    ('touzi','full',8),
    ('zhapian','sim_first',9),
    ('zhapian','sim_first',11),
    ('zhapian','sim_first',12),
    ('zhapian','full',9),
    ('zhapian','full',10),
    ('zhapian','full',11),
    ('zhapian','full',12),
    ('zhapian','full',13),
    ('xuedai','sim_first',14),
    ('xuedai','sim_first',15),
    ('xuedai','sim_first',16),
    ('xuedai','full',14),
    ('xuedai','full',15),
    ('xuedai','full',16),
    ('xuedai','full',17),
    ('xuedai','full',18),
    ('baoshui','sim_first',19),
    ('baoshui','sim_first',20),
    ('baoshui','full',19),
    ('baoshui','full',20),
    ('baoshui','full',21),
    ('baoshui','full',22),
    ('baoshui','full',23),
    ('zuwu','sim_first',25),
    ('zuwu','sim_first',27),
    ('zuwu','sim_first',28),
    ('zuwu','full',24),
    ('zuwu','full',25),
    ('zuwu','full',26),
    ('zuwu','full',27),
    ('zuwu','full',28),
    ('baoxian','sim_first',29),
    ('baoxian','sim_first',31),
    ('baoxian','sim_first',32),
    ('baoxian','full',29),
    ('baoxian','full',30),
    ('baoxian','full',31),
    ('baoxian','full',32),
    ('baoxian','full',33),
    ('chuangye','sim_first',34),
    ('chuangye','sim_first',35),
    ('chuangye','sim_first',36),
    ('chuangye','full',34),
    ('chuangye','full',35),
    ('chuangye','full',36),
    ('chuangye','full',37),
    ('chuangye','full',38),
    ('caiwujuece','sim_first',41),
    ('caiwujuece','full',41)
),
students_mode as (
  select id as student_id, coalesce(mode, 'sim_first') as mode from public.students
),
needed as (
  select sm.student_id, r.line_slug, r.module_number
  from students_mode sm
  join required r on r.mode = sm.mode
),
per_line as (
  select n.student_id, n.line_slug,
         count(*) as required_count,
         count(p.completed_at) as done_count,
         max(p.completed_at) as last_station_at
  from needed n
  left join public.module_progress p
    on p.student_id = n.student_id
   and p.module_number = n.module_number
   and p.completed_at is not null
  group by n.student_id, n.line_slug
),
first_run as (
  select student_id, line_slug, min(created_at) as first_run_at
  from public.simulation_runs
  group by student_id, line_slug
)
insert into public.line_completions (student_id, line_slug, completed_at)
select pl.student_id, pl.line_slug, greatest(pl.last_station_at, fr.first_run_at)
from per_line pl
join first_run fr on fr.student_id = pl.student_id and fr.line_slug = pl.line_slug
where pl.done_count = pl.required_count
on conflict (student_id, line_slug) do nothing;

commit;
