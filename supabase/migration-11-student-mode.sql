-- Item 3 — how a student is working through the platform.
--
-- Two entry modes over ONE content base:
--   'full'      every station, in order, then the terminal simulation.
--   'sim_first' straight to the simulation, with each core station's key
--               point surfaced as an inline tip. Reading is optional.
--
-- This is the only schema change item 3 needs. Station tier (core/deep) lives
-- in lib/modules.ts alongside the rest of each station's metadata, not here:
-- no student row points at a tier, so there is nothing to orphan, and
-- splitting station metadata across code and database is what produced the
-- consumer drift this project has already had to fix once.
--
-- Mode, by contrast, is per-student state that has to survive across visits
-- and devices, so it belongs on the student row and is reached by access code
-- like everything else about them.
--
-- Nullable with no default on purpose: null means "has not chosen yet", which
-- is what drives the one-time mode picker. A default would silently opt every
-- existing student into a mode nobody picked for them.
--
-- Additive and safe to run while the app serves; existing code ignores it.

begin;

alter table public.students
  add column if not exists mode text
  check (mode is null or mode in ('sim_first', 'full'));

comment on column public.students.mode is
  'Entry mode: sim_first | full. Null means not yet chosen — the app asks once, then persists. Station tier lives in lib/modules.ts, not the database.';

commit;
