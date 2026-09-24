-- Reverse of migration-08-lines-identity.sql.
--
-- Safe to run only while the application is still dual-writing line_slug (see
-- the transition note in the up migration). line_slug is the source of truth
-- being restored to; if any row was written with line_id alone, its line_slug
-- is wrong or defaulted and this reversal will preserve that error rather than
-- fix it. Check for that first:
--
--   select count(*) from public.simulation_runs r
--     join public.lines l on l.id = r.line_id
--    where r.line_slug is distinct from l.slug;
--
--   -- and the same for line_tests and class_rooms
--
-- A non-zero count means slug and id disagree somewhere. Resolve that before
-- reversing, or those rows will be orphaned by exactly the bug this migration
-- existed to prevent.
--
-- Drops no student data: only the added column, its constraints, and the
-- lines table itself.

begin;

drop index if exists public.simulation_runs_student_line_id_idx;
drop index if exists public.line_tests_student_line_id_idx;

alter table public.simulation_runs drop constraint if exists simulation_runs_line_id_fkey;
alter table public.line_tests      drop constraint if exists line_tests_line_id_fkey;
alter table public.class_rooms     drop constraint if exists class_rooms_line_id_fkey;

alter table public.simulation_runs drop column if exists line_id;
alter table public.line_tests      drop column if exists line_id;
alter table public.class_rooms     drop column if exists line_id;

comment on column public.simulation_runs.line_slug is null;
comment on column public.line_tests.line_slug is null;
comment on column public.class_rooms.line_slug is null;

-- Dropped last: the FKs above must be gone first.
drop table if exists public.lines;

commit;
