-- Foreign keys from line_slug to lines.slug (open question 8).
--
-- line_id already carries identity and is already constrained. line_slug is
-- the denormalised copy every query actually reads, and nothing stops it
-- holding a value that is not a line at all — a typo in a write path, or a
-- slug that changed without its rows following. This closes that.
--
-- ON UPDATE CASCADE is the point of the exercise: with it, renaming a slug in
-- lines rewrites every dependent row in the same statement. That is exactly
-- what open question 7 (renaming qixin to match 消費線) needs, and this
-- constraint is what makes that rename a one-row change rather than a
-- three-table data migration. It is safe to add while Q7 itself stays
-- blocked — the constraint neither performs nor implies that rename.
--
-- ON DELETE RESTRICT: a line with student history cannot be removed out from
-- under it. Deleting a line is not a thing this product does, and if it ever
-- becomes one, it should fail loudly rather than orphan a passport stamp.
--
-- lines.slug already carries a unique constraint (lines_slug_key, from
-- migration 08), which is the FK target; no new unique constraint is needed.
--
-- PRE-FLIGHT. Run this first and confirm all three counts are zero. A
-- non-zero count means a row points at a slug that does not exist, and the
-- ALTERs below will fail — fix the data, do not weaken the constraint:
--
--   select 'simulation_runs' t, count(*) filter (where l.slug is null) orphaned
--     from simulation_runs r left join lines l on l.slug = r.line_slug
--   union all
--   select 'line_tests', count(*) filter (where l.slug is null)
--     from line_tests x left join lines l on l.slug = x.line_slug
--   union all
--   select 'class_rooms', count(*) filter (where l.slug is null)
--     from class_rooms c left join lines l on l.slug = c.line_slug;
--
-- Additive and validating. Each ALTER takes a brief lock to check existing
-- rows; at this table size that is milliseconds.

begin;

alter table public.simulation_runs
  drop constraint if exists simulation_runs_line_slug_fkey;
alter table public.simulation_runs
  add constraint simulation_runs_line_slug_fkey
  foreign key (line_slug) references public.lines(slug)
  on update cascade on delete restrict;

alter table public.line_tests
  drop constraint if exists line_tests_line_slug_fkey;
alter table public.line_tests
  add constraint line_tests_line_slug_fkey
  foreign key (line_slug) references public.lines(slug)
  on update cascade on delete restrict;

alter table public.class_rooms
  drop constraint if exists class_rooms_line_slug_fkey;
alter table public.class_rooms
  add constraint class_rooms_line_slug_fkey
  foreign key (line_slug) references public.lines(slug)
  on update cascade on delete restrict;

commit;
