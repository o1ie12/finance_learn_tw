-- Down for migration 26. Re-opens the gap; only for rolling back.
alter table public.line_completions disable row level security;
