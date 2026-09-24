-- Verification for migration-08-lines-identity.sql.
--
-- Run section A BEFORE the migration and keep the output. Run sections B and C
-- AFTER. The acceptance criterion is that A and B agree exactly and C returns
-- no rows.

-- A / B — row counts. Must be identical before and after. -------------------
select 'simulation_runs' as table_name, count(*) as rows from public.simulation_runs
union all
select 'line_tests',      count(*) from public.line_tests
union all
select 'class_rooms',     count(*) from public.class_rooms
union all
select 'module_progress', count(*) from public.module_progress
union all
select 'coach_messages',  count(*) from public.coach_messages
union all
select 'students',        count(*) from public.students
order by table_name;

-- C — integrity. Every query below must return zero rows. -------------------

-- C1. No dependent row left without an identity.
select 'null line_id in simulation_runs' as problem, count(*) as n
  from public.simulation_runs where line_id is null
having count(*) > 0
union all
select 'null line_id in line_tests', count(*)
  from public.line_tests where line_id is null
having count(*) > 0
union all
select 'null line_id in class_rooms', count(*)
  from public.class_rooms where line_id is null
having count(*) > 0;

-- C2. line_id and the deprecated line_slug must still agree. A row here means
-- the dual write is broken, and reversing the migration would orphan it.
select 'simulation_runs slug/id disagree' as problem, count(*) as n
  from public.simulation_runs r
  join public.lines l on l.id = r.line_id
 where r.line_slug is distinct from l.slug
having count(*) > 0
union all
select 'line_tests slug/id disagree', count(*)
  from public.line_tests t
  join public.lines l on l.id = t.line_id
 where t.line_slug is distinct from l.slug
having count(*) > 0
union all
select 'class_rooms slug/id disagree', count(*)
  from public.class_rooms c
  join public.lines l on l.id = c.line_id
 where c.line_slug is distinct from l.slug
having count(*) > 0;

-- C3. Every distinct slug in the data has a home in lines. A row here is a
-- slug the seed did not anticipate.
select distinct line_slug as unseeded_slug from public.simulation_runs
  where line_id is null
union
select distinct line_slug from public.line_tests  where line_id is null
union
select distinct line_slug from public.class_rooms where line_id is null;

-- D — the point of the exercise. Renaming a slug must not move history.
-- Run inside a transaction and roll back; this is a rehearsal, not a change.
--
-- begin;
--   update public.lines set slug = 'xiaofei', title_zh = '消費線' where id = 1;
--   -- history still resolves, because it was never keyed to the slug:
--   select l.slug, l.title_zh, count(*) as runs
--     from public.simulation_runs r join public.lines l on l.id = r.line_id
--    where l.id = 1 group by l.slug, l.title_zh;
-- rollback;
