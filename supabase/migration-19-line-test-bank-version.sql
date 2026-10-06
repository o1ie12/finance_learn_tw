-- Record which version of a line's pre/post question bank each attempt used.
--
-- line_tests stores only score/total; the questions live in code
-- (lib/prePostQuestions.ts). When a bank is replaced, an old score and a new
-- score are numbers out of the same total that measured different things, and
-- the line page would happily show "前測 6 題 → 後測 8 題，進步了 2 題" across
-- the two. This column lets the app compare a pre and a post only when both
-- were taken on the same bank.
--
-- Every existing row was taken on version 1 of its line's bank, which is
-- exactly what the default records. Nothing is rewritten.
--
-- Additive and metadata-only. Apply BEFORE deploying the code that writes it:
-- that code inserts bank_version, and an insert naming a missing column fails.

begin;

alter table public.line_tests
  add column if not exists bank_version integer not null default 1;

alter table public.line_tests
  add constraint line_tests_bank_version_positive check (bank_version >= 1);

commit;
