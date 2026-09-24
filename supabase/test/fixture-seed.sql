-- Representative data for testing migration-08 locally. Stands in for the
-- pilot's shape, not its contents: several students, runs spread across
-- different lines, pre/post test pairs (the rows whose loss would matter most),
-- a class room, module progress, and a coach message hanging off a run.

insert into public.students (id, name, school, grade, access_code) values
  ('11111111-1111-1111-1111-111111111111', '小明', '測試高中', '高一', 'AAA111'),
  ('22222222-2222-2222-2222-222222222222', '小美', '測試高中', '高二', 'BBB222'),
  ('33333333-3333-3333-3333-333333333333', '阿凱', '另一高中', '高三', 'CCC333');

-- Runs across four different lines, including two for one student on one line
-- (replays) so the latest-run logic has something to disambiguate.
insert into public.simulation_runs (id, student_id, line_slug, spending_choices, outcome_summary) values
  ('aaaaaaa1-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'qixin',    '{"tpass":true}',                  '{"leftover":5000}'),
  ('aaaaaaa1-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'xinyong',  '{"choices":["full","full","full"]}', '{"totalInterest":0}'),
  ('aaaaaaa1-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'xinyong',  '{"choices":["minimum","minimum","minimum"]}', '{"totalInterest":211}'),
  ('aaaaaaa1-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 'touzi',    '{"choice":"buy0050"}',            '{"start":10000}'),
  ('aaaaaaa1-0000-0000-0000-000000000005', '33333333-3333-3333-3333-333333333333', 'chuangye', '{"priceId":"low"}',               '{"survived":true}');

-- The pre/post pairs — the learning-gain evidence.
insert into public.line_tests (student_id, line_slug, phase, score, total) values
  ('11111111-1111-1111-1111-111111111111', 'xinyong', 'pre',  2, 6),
  ('11111111-1111-1111-1111-111111111111', 'xinyong', 'post', 5, 6),
  ('22222222-2222-2222-2222-222222222222', 'touzi',   'pre',  3, 6),
  ('22222222-2222-2222-2222-222222222222', 'touzi',   'post', 6, 6),
  ('33333333-3333-3333-3333-333333333333', 'qixin',   'pre',  1, 6);

insert into public.class_rooms (code, host_token, line_slug, status) values
  ('ROOM01', 'tok-1', 'xinyong', 'finished'),
  ('ROOM02', 'tok-2', 'zhapian', 'waiting');

insert into public.module_progress (student_id, module_number, completed_at, quiz_score, quiz_total) values
  ('11111111-1111-1111-1111-111111111111', 4, now(), 3, 3),
  ('11111111-1111-1111-1111-111111111111', 7, now(), 2, 3),
  ('22222222-2222-2222-2222-222222222222', 5, now(), 3, 3);

insert into public.coach_messages (simulation_run_id, message) values
  ('aaaaaaa1-0000-0000-0000-000000000003', '這三期帳單你產生了 NT$211 的循環利息。');
