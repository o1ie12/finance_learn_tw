-- Migration 03: progress points (起點護照 gamification layer).
-- Additive and backward-compatible — safe to run against the live DB.
--
-- Outcome-title "stamps" for the passport are deliberately NOT stored: they
-- are derived on read from simulation_runs.spending_choices/outcome_summary
-- (already captured), so there's nothing to migrate for those. See
-- lib/outcomeTitle.ts.

alter table public.students
  add column if not exists points_total integer not null default 0;
