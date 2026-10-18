#!/usr/bin/env bash
# Test harness for the redesign migrations (21..25). Builds a throwaway
# Postgres cluster in a temp dir on its own port and socket, so it never
# touches a running server, the qidian_dev database or Supabase:
#
#   1. schema.sql + fixtures + the migrations setup-local-db.sh applies
#   2. baseline snapshot of the rows that already exist
#   3. 21..25 up; new tables, columns, indexes and RLS present; old rows intact
#   4. behaviour: unique indexes, defaults, checks, foreign keys, cascades
#   5. every down file in reverse; all of it gone; old rows still intact
#   6. up again, then up a second time (idempotent), then down twice
#   7. stop the cluster and delete the temp dir (also on failure)
#
# Usage: supabase/test/run-redesign-migrations.sh
# Env:   PGBIN (default /opt/homebrew/bin), PORT (default 55432)
set -euo pipefail

PGBIN="${PGBIN:-/opt/homebrew/bin}"
PORT="${PORT:-55432}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SUPA="$(dirname "$HERE")"

# /tmp, not $TMPDIR: the Unix socket lives in this dir, and macOS caps a
# socket path near 104 bytes, which a long $TMPDIR can exceed.
TMP="$(mktemp -d /tmp/finline-mig.XXXXXX)"
DB=redesign_test
PSQL="$PGBIN/psql -X -q -v ON_ERROR_STOP=1 -h $TMP -p $PORT -U postgres -d $DB"
FAILS=0
export PGCLIENTENCODING=UTF8
# The re-runs below exist to prove "already exists, skipping"; no need to
# print each one.
export PGOPTIONS="-c client_min_messages=warning"

cleanup() {
  if [ -f "$TMP/data/postmaster.pid" ]; then
    "$PGBIN/pg_ctl" -D "$TMP/data" -m fast -w stop >/dev/null 2>&1 || true
  fi
  rm -rf "$TMP"
}
trap cleanup EXIT

banner() { printf '\n\033[1m── %s\033[0m\n' "$1"; }
q() { $PSQL -At -c "$1"; }
pass() { printf '  PASS  %s\n' "$1"; }
fail() { printf '  FAIL  %s\n' "$1"; FAILS=$((FAILS + 1)); }
expect() { # expect <label> <expected> <sql>
  local got
  got="$(q "$3")"
  if [ "$got" = "$2" ]; then pass "$1"; else fail "$1 (expected '$2', got '$got')"; fi
}
expect_error() { # expect_error <label> <sqlstate> <sql>
  local out
  if out="$($PSQL -v VERBOSITY=verbose -c "$3" 2>&1)"; then
    fail "$1 (statement succeeded)"
  elif printf '%s' "$out" | grep -q "$2"; then
    pass "$1 ($2)"
  else
    fail "$1 (wrong error: $(printf '%s' "$out" | head -1))"
  fi
}
apply() { $PSQL -f "$SUPA/$1" >/dev/null; echo "  applied $1"; }

UPS=(
  migration-21-life-game-saves.sql
  migration-22-student-avatar.sql
  migration-23-daily-activity.sql
  migration-24-task-results.sql
  migration-25-class-life-rooms.sql
  migration-26-line-completions-rls.sql
)
DOWNS=(
  migration-26-line-completions-rls-down.sql
  migration-25-class-life-rooms-down.sql
  migration-24-task-results-down.sql
  migration-23-daily-activity-down.sql
  migration-22-student-avatar-down.sql
  migration-21-life-game-saves-down.sql
)

# Rows that exist before the redesign, projected onto their pre-redesign
# columns so an added column does not change the checksum.
SNAPSHOT_SQL="
select 'students', count(*), md5(coalesce(string_agg(concat_ws('|', id, name, school, grade, access_code, google_uid, points_total, mode, profile::text), ',' order by id), '')) from students
union all select 'class_rooms', count(*), md5(coalesce(string_agg(concat_ws('|', id, code, host_token, line_slug, line_id, status, started_at), ',' order by id), '')) from class_rooms
union all select 'class_participants', count(*), md5(coalesce(string_agg(concat_ws('|', id, room_id, display_name, score, total_ms, submitted_at), ',' order by id), '')) from class_participants
union all select 'simulation_runs', count(*), md5(coalesce(string_agg(concat_ws('|', id, student_id, line_slug, kind, outcome_summary::text), ',' order by id), '')) from simulation_runs
union all select 'line_tests', count(*), md5(coalesce(string_agg(concat_ws('|', id, student_id, line_slug, phase, score, total), ',' order by id), '')) from line_tests
union all select 'module_progress', count(*), md5(coalesce(string_agg(concat_ws('|', id, student_id, module_number, quiz_score), ',' order by id), '')) from module_progress
union all select 'coach_messages', count(*), md5(coalesce(string_agg(concat_ws('|', id, message), ',' order by id), '')) from coach_messages
union all select 'line_completions', count(*), md5(coalesce(string_agg(concat_ws('|', id, student_id, line_slug), ',' order by id), '')) from line_completions
union all select 'lines', count(*), md5(coalesce(string_agg(concat_ws('|', id, slug, title_zh), ',' order by id), '')) from lines
order by 1;"

compare_snapshot() { # compare_snapshot <label>
  q "$SNAPSHOT_SQL" > "$TMP/snap-now.txt"
  if diff -q "$TMP/snap-before.txt" "$TMP/snap-now.txt" >/dev/null; then
    pass "$1: pre-existing rows identical ($(wc -l < "$TMP/snap-now.txt" | tr -d ' ') tables checked)"
  else
    fail "$1: pre-existing rows changed"
    diff "$TMP/snap-before.txt" "$TMP/snap-now.txt" || true
  fi
}

assert_up_state() { # assert_up_state <label>
  local t
  for t in life_game_saves daily_activity task_results; do
    expect "$1: table $t exists" "$t" "select to_regclass('public.$t');"
    expect "$1: RLS enabled on $t" "t" "select relrowsecurity from pg_class where oid='public.$t'::regclass;"
    expect "$1: no policies on $t" "0" "select count(*) from pg_policies where tablename='$t';"
  done
  expect "$1: RLS enabled on line_completions (migration 26)" "t" \
    "select relrowsecurity from pg_class where oid='public.line_completions'::regclass;"
  expect "$1: index life_game_saves_solo (partial, unique)" "t|t" \
    "select i.indisunique, i.indpred is not null from pg_index i where i.indexrelid='public.life_game_saves_solo'::regclass;"
  expect "$1: index life_game_saves_team (partial, unique)" "t|t" \
    "select i.indisunique, i.indpred is not null from pg_index i where i.indexrelid='public.life_game_saves_team'::regclass;"
  expect "$1: index task_results_student_task_set_idx" "task_results_student_task_set_idx" \
    "select to_regclass('public.task_results_student_task_set_idx');"
  expect "$1: daily_activity primary key (student_id, day)" "student_id,day" \
    "select string_agg(a.attname, ',' order by k.ord) from pg_constraint c cross join unnest(c.conkey) with ordinality k(attnum, ord) join pg_attribute a on a.attrelid=c.conrelid and a.attnum=k.attnum where c.conrelid='public.daily_activity'::regclass and c.contype='p';"
  expect "$1: students.avatar jsonb null" "jsonb|YES" \
    "select data_type, is_nullable from information_schema.columns where table_name='students' and column_name='avatar';"
  expect "$1: class_rooms.kind text not null default 'quiz'" "NO|'quiz'::text" \
    "select is_nullable, column_default from information_schema.columns where table_name='class_rooms' and column_name='kind';"
  expect "$1: class_rooms.seed bigint null" "bigint|YES" \
    "select data_type, is_nullable from information_schema.columns where table_name='class_rooms' and column_name='seed';"
  expect "$1: class_participants.team text null" "text|YES" \
    "select data_type, is_nullable from information_schema.columns where table_name='class_participants' and column_name='team';"
  expect "$1: existing rooms read as quiz, seed null" "0" \
    "select count(*) from class_rooms where kind <> 'quiz' or seed is not null;"
  expect "$1: existing participants have no team" "0" "select count(*) from class_participants where team is not null;"
  expect "$1: existing students have no avatar" "0" "select count(*) from students where avatar is not null;"
}

assert_down_state() { # assert_down_state <label>
  local t
  for t in life_game_saves daily_activity task_results; do
    expect "$1: table $t gone" "" "select to_regclass('public.$t');"
  done
  expect "$1: students.avatar gone" "f" "select exists (select 1 from information_schema.columns where table_name='students' and column_name='avatar');"
  expect "$1: class_rooms.kind gone" "f" "select exists (select 1 from information_schema.columns where table_name='class_rooms' and column_name='kind');"
  expect "$1: class_rooms.seed gone" "f" "select exists (select 1 from information_schema.columns where table_name='class_rooms' and column_name='seed');"
  expect "$1: class_participants.team gone" "f" "select exists (select 1 from information_schema.columns where table_name='class_participants' and column_name='team');"
  expect "$1: class_rooms_kind_check gone" "0" "select count(*) from pg_constraint where conname='class_rooms_kind_check';"
}

banner "throwaway cluster in $TMP (port $PORT)"
"$PGBIN/initdb" -D "$TMP/data" -U postgres -A trust -E UTF8 --no-locale >/dev/null
# LC_ALL: on macOS the postmaster refuses to start ("became multithreaded
# during startup") when the inherited locale is not one it can load.
LC_ALL=C "$PGBIN/pg_ctl" -D "$TMP/data" -l "$TMP/server.log" \
  -o "-p $PORT -k $TMP -c listen_addresses=''" -w start >/dev/null \
  || { cat "$TMP/server.log"; exit 1; }
"$PGBIN/createdb" -h "$TMP" -p "$PORT" -U postgres "$DB"
q "select version();"

banner "1. build to the state setup-local-db.sh produces"
apply schema.sql
$PSQL -f "$HERE/fixture-seed.sql" >/dev/null; echo "  applied test/fixture-seed.sql"
for m in \
  migration-08-lines-identity.sql \
  migration-10-simulation-kind.sql \
  migration-11-student-mode.sql \
  migration-12-student-profile.sql \
  migration-13-career-line.sql \
  migration-14-xiaofei-title.sql \
  migration-15-capstone-line.sql \
  migration-16-line-slug-fk.sql \
  migration-17-line-slug-no-default.sql \
  migration-18-split-adjust-0050.sql \
  migration-19-line-test-bank-version.sql \
  migration-20-line-completions.sql; do
  apply "$m"
done
# The fixtures have no class participant; add one so the new team column is
# exercised against a row that predates it.
q "insert into class_participants (id, room_id, display_name, score)
   select '99999999-0000-0000-0000-000000000001', id, '舊同學', 3 from class_rooms where code='ROOM01';" >/dev/null
expect "caiwujuece is a seeded line (life rooms use it as line_slug)" "1" \
  "select count(*) from lines where slug='caiwujuece';"

banner "2. baseline snapshot"
q "$SNAPSHOT_SQL" | tee "$TMP/snap-before.txt"

banner "3. up 21..25"
for m in "${UPS[@]}"; do apply "$m"; done
assert_up_state "up"
compare_snapshot "up"

banner "4. behaviour"
S1=11111111-1111-1111-1111-111111111111
S2=22222222-2222-2222-2222-222222222222
S3=33333333-3333-3333-3333-333333333333
q "insert into life_game_saves (student_id, state, seed) values ('$S1', '{\"version\":1}', 4294967295);" >/dev/null
pass "solo save inserted (seed holds a full uint32)"
expect_error "second solo save for one student rejected" 23505 \
  "insert into life_game_saves (student_id, state, seed) values ('$S1', '{}', 1);"
q "insert into life_game_saves (student_id, class_team_id, state, seed) values ('$S1', 'room-x:A', '{}', 7);" >/dev/null
pass "same student can also captain a team save"
expect_error "second save for one team rejected" 23505 \
  "insert into life_game_saves (student_id, class_team_id, state, seed) values ('$S2', 'room-x:A', '{}', 7);"
q "insert into life_game_saves (student_id, class_team_id, state, seed) values ('$S2', 'room-x:B', '{}', 7);" >/dev/null
pass "another team in the same room gets its own save"
expect "state_version defaults to 1; updated_at set" "1|t" \
  "select state_version, updated_at is not null from life_game_saves where student_id='$S2';"
expect "prefix lookup finds both teams of room-x" "2" \
  "select count(*) from life_game_saves where class_team_id like 'room-x:%';"
expect "optimistic update with a stale updated_at matches nothing" "0" \
  "with u as (update life_game_saves set state='{\"v\":2}', updated_at=now() where class_team_id='room-x:B' and updated_at='2000-01-01' returning 1) select count(*) from u;"

q "insert into daily_activity (student_id, day) values ('$S1', '2026-10-17');" >/dev/null
expect "daily_activity.actions defaults to 0" "0" "select actions from daily_activity where student_id='$S1';"
expect_error "one row per student per day" 23505 \
  "insert into daily_activity (student_id, day, actions) values ('$S1', '2026-10-17', 1);"
q "insert into daily_activity (student_id, day, actions) values ('$S1', '2026-10-17', 1)
   on conflict (student_id, day) do update set actions = daily_activity.actions + 1;" >/dev/null
expect "upsert increments" "1" "select actions from daily_activity where student_id='$S1' and day='2026-10-17';"

q "insert into task_results (student_id, line_slug, station_id, task_set_id, kind, score, total, result)
   values ('$S1', 'xinyong', 4, 'xinyong-4', 'xinyong_bank_v1', 2.5, 3, '{\"steps\":[]}');" >/dev/null
expect "task_results: attempt defaults to 1, fractional score kept" "1|2.5" \
  "select attempt, score from task_results where student_id='$S1';"
expect_error "task_results.line_slug must be a real line" 23503 \
  "insert into task_results (student_id, line_slug, task_set_id, kind, score, total, result)
   values ('$S1', 'no-such-line', 't', 'k', 0, 1, '{}');"

q "insert into class_rooms (code, host_token, line_slug) values ('QUIZNEW', 'tok-q', 'touzi');" >/dev/null
expect "an old-style room insert (no kind) is a quiz" "quiz" "select kind from class_rooms where code='QUIZNEW';"
q "insert into class_rooms (code, host_token, line_slug, line_id, kind, seed)
   select 'LIFE01', 'tok-l', slug, id, 'life', 123456789 from lines where slug='caiwujuece';" >/dev/null
pass "life room inserted on caiwujuece with a seed"
expect_error "kind outside quiz/life rejected" 23514 \
  "insert into class_rooms (code, host_token, line_slug, kind) values ('BAD01', 'tok-b', 'touzi', 'bogus');"
q "insert into class_participants (room_id, display_name) select id, '舊路徑' from class_rooms where code='LIFE01';
   insert into class_participants (room_id, display_name, team) select id, '新路徑', 'A' from class_rooms where code='LIFE01';" >/dev/null
expect "participants join with and without a team" "1|1" \
  "select count(*) filter (where team is null), count(*) filter (where team = 'A') from class_participants p join class_rooms r on r.id=p.room_id where r.code='LIFE01';"

q "insert into life_game_saves (student_id, state, seed) values ('$S3', '{}', 1);
   insert into daily_activity (student_id, day, actions) values ('$S3', '2026-10-16', 2);
   insert into task_results (student_id, line_slug, task_set_id, kind, score, total, result) values ('$S3', 'qixin', 't', 'k', 1, 1, '{}');" >/dev/null
expect "cascade: deleting a student removes their saves, activity and results" "0|0|0" "
  begin;
  delete from simulation_runs where student_id='$S3';
  delete from line_tests where student_id='$S3';
  delete from students where id='$S3';
  select (select count(*) from life_game_saves where student_id='$S3'),
         (select count(*) from daily_activity where student_id='$S3'),
         (select count(*) from task_results where student_id='$S3');
  rollback;"

# Remove what the behaviour step added to pre-existing tables, so the
# snapshot comparison after the down files is honest.
q "delete from class_rooms where code in ('QUIZNEW', 'LIFE01');" >/dev/null
compare_snapshot "after behaviour cleanup"

banner "5. down 25..21"
for m in "${DOWNS[@]}"; do apply "$m"; done
assert_down_state "down"
compare_snapshot "down"

banner "6. up again, up twice (idempotent), down twice"
for m in "${UPS[@]}"; do apply "$m"; done
assert_up_state "re-up"
for m in "${UPS[@]}"; do apply "$m"; done
pass "second up run raised no error"
assert_up_state "up x2"
expect "still exactly one kind check constraint" "1" "select count(*) from pg_constraint where conname='class_rooms_kind_check';"
compare_snapshot "up x2"
for m in "${DOWNS[@]}"; do apply "$m"; done
for m in "${DOWNS[@]}"; do apply "$m"; done
pass "second down run raised no error"
assert_down_state "down x2"
compare_snapshot "down x2"

banner "done"
if [ "$FAILS" -eq 0 ]; then
  echo "ALL PASS"
else
  echo "$FAILS FAILURE(S)"
  exit 1
fi
