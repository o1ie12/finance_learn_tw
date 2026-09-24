-- Line 1 is now 消費線 (Spending), not 起薪線 (Starting Salary).
--
-- The simulation was reframed from "pick a savings rate against a fixed
-- rent" to "divide a month's income and then meet an unplanned expense",
-- and the line's name followed. Income now comes from 職涯線, which is
-- where a starting salary belongs.
--
-- Only the label moves. id stays 1 and slug stays 'qixin', so every
-- simulation_runs row keeps pointing at the same line — which is the
-- entire reason identity and display metadata were split apart in
-- migration 08. Renaming the slug would instead orphan the line_slug
-- recorded on existing runs, for a change that is purely editorial.
--
-- Metadata-only. Safe to run at any time, before or after the deploy.

begin;

update public.lines
   set title_zh = '消費線'
 where id = 1
   and slug = 'qixin';

commit;
