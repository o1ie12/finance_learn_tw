-- Drop the column default on simulation_runs.line_slug.
--
-- schema.sql created the column with `default 'qixin'` back when 起薪線 was
-- line 1 and the only line with a simulation. The app has supplied line_slug
-- explicitly on every insert for a long time, so the default has been inert —
-- but it encodes a superseded fact about which line is "first", and a write
-- path that ever forgot the column would silently file a run under the wrong
-- line rather than failing. NOT NULL stays; only the default goes.
--
-- Metadata-only. Safe to run at any time, before or after the deploy.

begin;

alter table public.simulation_runs
  alter column line_slug drop default;

commit;
