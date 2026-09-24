-- Identity row for 職涯線 (Career & Income), the new line at position 1.
--
-- Required before the code that writes its simulation runs deploys.
-- simulation_runs.line_id is NOT NULL with a foreign key to lines, and
-- lib/lines.ts resolves this line to id 11 — so without this row every
-- attempt to record a 職涯線 run is rejected by the constraint.
--
-- id 11 continues the sequence rather than filling a gap or reusing one.
-- Identity is append-only: display order lives in lib/lines.ts, where this
-- line sits first, and the two have nothing to do with each other. That
-- separation is the entire point of the lines table.
--
-- Additive. Safe to run before the deploy, and required to run before it.

begin;

insert into public.lines (id, slug, title_zh, sort_order)
values (11, 'zhiya', '職涯線', 11)
on conflict (id) do nothing;

-- Keep the identity sequence ahead of the seeded ids.
select setval(
  pg_get_serial_sequence('public.lines', 'id'),
  (select max(id) from public.lines)
);

commit;
