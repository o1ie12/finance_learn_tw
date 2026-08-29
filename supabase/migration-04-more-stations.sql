-- Migration 04: widen module_progress's module_number check constraint to
-- make room for new stations (存錢線/信用線/投資線 each gaining a second
-- station: modules 6, 7, 8). Additive and backward-compatible — existing
-- rows (module_number 1-5) are unaffected.

alter table public.module_progress
  drop constraint if exists module_progress_module_number_check;

alter table public.module_progress
  add constraint module_progress_module_number_check
  check (module_number between 1 and 50);
