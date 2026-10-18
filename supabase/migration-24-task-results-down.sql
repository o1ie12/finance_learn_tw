-- Down for migration-24. Deploy code that does not read or write task_results
-- first. Per-step task detail is lost; station completion is unaffected
-- (it lives in module_progress and line_completions).
begin;
drop table if exists public.task_results;
commit;
