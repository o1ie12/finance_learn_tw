-- 起點 (Qidian) multi-line migration.
-- Additive and backward-compatible: existing First Salary runs become
-- line_slug = 'qixin', and the two First-Salary-specific columns become
-- nullable so other lines' simulations can reuse the table. Safe to run on the
-- live database before deploying the redesign — the current site keeps working.
--
-- Run once in the Supabase SQL editor.

alter table public.simulation_runs
  add column if not exists line_slug text not null default 'qixin';

alter table public.simulation_runs alter column rent_choice drop not null;
alter table public.simulation_runs alter column savings_rate drop not null;

create index if not exists simulation_runs_student_line_idx
  on public.simulation_runs (student_id, line_slug, created_at desc);
