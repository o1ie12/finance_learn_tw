-- PHASE 2 OF 2 — "contract". Run ONLY after the dual-write app change is
-- deployed and confirmed writing line_id on every insert.
--
-- Between migration-08 and that deploy there is a window where the old code
-- is still writing rows with line_id null. This migration closes that window:
-- it re-backfills anything written during the gap, reports what it caught,
-- and only then applies NOT NULL.
--
-- Running this BEFORE the dual-write is deployed will appear to succeed and
-- then break every subsequent insert, because the old code cannot satisfy the
-- constraint. Confirm the deploy first. The guard below tells you how many
-- gap rows it found — a large number is a sign the window was open longer
-- than intended, not that the migration failed.
--
-- Reversible: migration-09-line-id-not-null-down.sql simply drops NOT NULL.

begin;

-- Re-backfill the gap. Same join as phase 1; only rows the old code wrote
-- since then will still be null.
update public.simulation_runs r set line_id = l.id
  from public.lines l where l.slug = r.line_slug and r.line_id is null;
update public.line_tests t set line_id = l.id
  from public.lines l where l.slug = t.line_slug and t.line_id is null;
update public.class_rooms c set line_id = l.id
  from public.lines l where l.slug = c.line_slug and c.line_id is null;

do $$
declare
  missing_runs  integer;
  missing_tests integer;
  missing_rooms integer;
begin
  select count(*) into missing_runs  from public.simulation_runs where line_id is null;
  select count(*) into missing_tests from public.line_tests      where line_id is null;
  select count(*) into missing_rooms from public.class_rooms     where line_id is null;

  if missing_runs > 0 or missing_tests > 0 or missing_rooms > 0 then
    raise exception
      'Rows remain unresolvable after re-backfill — simulation_runs: %, line_tests: %, class_rooms: %. These hold a line_slug with no matching lines row. Investigate before applying NOT NULL; nothing has been committed.',
      missing_runs, missing_tests, missing_rooms;
  end if;
end $$;

alter table public.simulation_runs alter column line_id set not null;
alter table public.line_tests      alter column line_id set not null;
alter table public.class_rooms     alter column line_id set not null;

commit;

-- After this, an insert without line_id fails loudly rather than silently
-- landing on the wrong line. That is the desired end state, and it is only
-- safe once every write path supplies the column.
