-- Migration 26: enable row level security on line_completions.
--
-- Every table in this project has RLS enabled with no policies, so only the
-- service role (which the app's server uses) can read or write it; the anon
-- key gets nothing through PostgREST. Migration 20 created line_completions
-- without the `enable row level security` line, so it was the one table the
-- anon key could read. This closes that gap. The app is unaffected: the
-- service role bypasses RLS.
--
-- Additive and safe to apply at any time, before or after a deploy.

alter table public.line_completions enable row level security;
