-- Down for migration-20. Deploy code that does not read line_completions
-- first: that code queries the table, and a query naming a missing table fails.
begin;
drop table if exists public.line_completions;
commit;
