-- Identity row for 財務決策線 (Financial Decisions), the capstone.
--
-- Required before the code that writes its simulation runs deploys.
-- simulation_runs.line_id is NOT NULL with a foreign key to lines, and
-- lib/lines.ts resolves this line to id 12 — so without this row every
-- attempt to record a capstone run is rejected by the constraint.
--
-- id 12 continues the sequence. sort_order is 12 as well, which here happens
-- to match where the line appears: it is the last one either way. That is a
-- coincidence, not a rule — display order lives in lib/lines.ts and the two
-- columns have nothing to do with each other.
--
-- Additive. Safe to run before the deploy, and required to run before it.

begin;

insert into public.lines (id, slug, title_zh, sort_order)
values (12, 'caiwujuece', '財務決策線', 12)
on conflict (id) do nothing;

select setval(
  pg_get_serial_sequence('public.lines', 'id'),
  (select max(id) from public.lines)
);

commit;
