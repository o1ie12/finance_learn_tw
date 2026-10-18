-- Down for migration-23. Deploy code that does not read daily_activity first.
-- Streak history is lost.
begin;
drop table if exists public.daily_activity;
commit;
