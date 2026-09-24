-- Reverse of migration-09. Drops the NOT NULL constraints, returning the
-- schema to the phase-1 state where line_id is present, backfilled and
-- foreign-keyed but nullable.
--
-- Use this if the dual-write needs to be rolled back: the old code can then
-- resume inserting without line_id rather than failing outright. Does not
-- touch any row.

begin;

alter table public.simulation_runs alter column line_id drop not null;
alter table public.line_tests      alter column line_id drop not null;
alter table public.class_rooms     alter column line_id drop not null;

commit;
