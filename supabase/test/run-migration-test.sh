#!/usr/bin/env bash
# Local test harness for migration-08. Builds a throwaway database from
# schema.sql, seeds representative rows, then exercises the migration:
#
#   1. baseline row counts
#   2. up migration
#   3. counts match, integrity checks clean, rename rehearsal
#   4. down migration
#   5. back to baseline
#   6. negative case — an unseeded slug must abort the whole migration
#
# Touches only the local throwaway DB. Never connects to Supabase.
set -euo pipefail

DB="${DB:-qidian_migration_test}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SUPA="$(dirname "$HERE")"
PSQL="psql -X -v ON_ERROR_STOP=1 -q -d $DB"

banner() { printf '\n\033[1m── %s\033[0m\n' "$1"; }

banner "reset database"
dropdb --if-exists "$DB"
createdb "$DB"

banner "build schema + seed fixtures"
$PSQL -f "$SUPA/schema.sql" >/dev/null
$PSQL -f "$HERE/fixture-seed.sql" >/dev/null
echo "ok"

banner "1. baseline counts"
$PSQL -c "
select 'simulation_runs' t, count(*) n from simulation_runs
union all select 'line_tests', count(*) from line_tests
union all select 'class_rooms', count(*) from class_rooms
union all select 'module_progress', count(*) from module_progress
union all select 'coach_messages', count(*) from coach_messages
order by t;" | tee /tmp/qidian-before.txt

banner "2. up migration"
$PSQL -f "$SUPA/migration-08-lines-identity.sql" >/dev/null
echo "applied"

banner "3a. counts after (must match baseline)"
$PSQL -c "
select 'simulation_runs' t, count(*) n from simulation_runs
union all select 'line_tests', count(*) from line_tests
union all select 'class_rooms', count(*) from class_rooms
union all select 'module_progress', count(*) from module_progress
union all select 'coach_messages', count(*) from coach_messages
order by t;" | tee /tmp/qidian-after.txt

if diff -q /tmp/qidian-before.txt /tmp/qidian-after.txt >/dev/null; then
  echo "PASS — row counts identical"
else
  echo "FAIL — row counts changed"; diff /tmp/qidian-before.txt /tmp/qidian-after.txt; exit 1
fi

banner "3b. integrity — every check must report 0"
$PSQL -c "
select
  (select count(*) from simulation_runs where line_id is null) as null_run_ids,
  (select count(*) from line_tests      where line_id is null) as null_test_ids,
  (select count(*) from class_rooms     where line_id is null) as null_room_ids,
  (select count(*) from simulation_runs r join lines l on l.id=r.line_id
     where r.line_slug is distinct from l.slug) as run_mismatch,
  (select count(*) from line_tests t join lines l on l.id=t.line_id
     where t.line_slug is distinct from l.slug) as test_mismatch,
  (select count(*) from class_rooms c join lines l on l.id=c.line_id
     where c.line_slug is distinct from l.slug) as room_mismatch;"

banner "3c. FKs actually present"
$PSQL -c "
select conrelid::regclass as tbl, conname, confdeltype as on_delete, confupdtype as on_update
from pg_constraint where contype='f' and conname like '%line_id%' order by tbl;"

banner "3d. the point — rename the slug, history must survive"
$PSQL -c "
begin;
  update lines set slug='xiaofei', title_zh='消費線' where id=1;
  select l.id, l.slug, l.title_zh,
         (select count(*) from simulation_runs r where r.line_id=l.id) as runs,
         (select count(*) from line_tests t where t.line_id=l.id) as tests
    from lines l where l.id=1;
rollback;"

banner "3e. LIVE-APP SAFETY — old code must still be able to insert after phase 1"
$PSQL -c "
insert into simulation_runs (student_id, line_slug, spending_choices, outcome_summary)
  values ('11111111-1111-1111-1111-111111111111','touzi','{}','{}');
insert into line_tests (student_id, line_slug, phase, score, total)
  values ('11111111-1111-1111-1111-111111111111','touzi','pre',1,6);
insert into class_rooms (code, host_token, line_slug)
  values ('ROOMGAP','tok-gap','touzi');" \
  && echo "PASS — un-updated app can still write (line_id left null, as designed)" \
  || { echo "FAIL — phase 1 broke the live write path"; exit 1; }

$PSQL -c "select
  (select count(*) from simulation_runs where line_id is null) as gap_runs,
  (select count(*) from line_tests where line_id is null) as gap_tests,
  (select count(*) from class_rooms where line_id is null) as gap_rooms;"

banner "3f. phase 2 — re-backfill the gap, then apply NOT NULL"
$PSQL -f "$SUPA/migration-09-line-id-not-null.sql" >/dev/null
echo "applied"
$PSQL -c "select
  (select count(*) from simulation_runs where line_id is null) as gap_runs,
  (select count(*) from line_tests where line_id is null) as gap_tests,
  (select count(*) from class_rooms where line_id is null) as gap_rooms;"

banner "3g. after phase 2, a write without line_id must now fail loudly"
if $PSQL -c "insert into class_rooms (code,host_token,line_slug) values ('ROOMBAD','tok-b','touzi');" >/dev/null 2>&1; then
  echo "FAIL — NOT NULL is not being enforced"; exit 1
else
  echo "PASS — rejected, as intended once every write path supplies line_id"
fi

banner "3h. reverse phase 2 only"
$PSQL -f "$SUPA/migration-09-line-id-not-null-down.sql" >/dev/null
$PSQL -c "insert into class_rooms (code,host_token,line_slug) values ('ROOMOK','tok-o','touzi');" >/dev/null \
  && echo "PASS — phase 2 reversal restores the tolerant state" \
  || { echo "FAIL"; exit 1; }

banner "3i. remove the rows this test added, so the baseline comparison is honest"
$PSQL -c "
delete from class_rooms where code in ('ROOMGAP','ROOMOK');
delete from line_tests where student_id='11111111-1111-1111-1111-111111111111'
  and line_slug='touzi' and phase='pre';
delete from simulation_runs where student_id='11111111-1111-1111-1111-111111111111'
  and line_slug='touzi';" >/dev/null
echo "cleaned"

banner "4. down migration (phase 1)"
$PSQL -f "$SUPA/migration-08-lines-identity-down.sql" >/dev/null
echo "reversed"

banner "5. back to baseline"
$PSQL -c "
select 'simulation_runs' t, count(*) n from simulation_runs
union all select 'line_tests', count(*) from line_tests
union all select 'class_rooms', count(*) from class_rooms
union all select 'module_progress', count(*) from module_progress
union all select 'coach_messages', count(*) from coach_messages
order by t;" > /tmp/qidian-down.txt
if diff -q /tmp/qidian-before.txt /tmp/qidian-down.txt >/dev/null; then
  echo "PASS — reversal restored baseline"
else
  echo "FAIL"; diff /tmp/qidian-before.txt /tmp/qidian-down.txt; exit 1
fi
$PSQL -c "select to_regclass('public.lines') as lines_table_should_be_null;"

banner "6. negative case — unseeded slug must abort"
$PSQL -c "insert into class_rooms (code,host_token,line_slug) values ('ROOM99','tok-9','a-slug-nobody-seeded');" >/dev/null
if $PSQL -f "$SUPA/migration-08-lines-identity.sql" >/tmp/qidian-neg.txt 2>&1; then
  echo "FAIL — migration committed despite an unmatched slug"; exit 1
else
  echo "PASS — aborted as designed:"
  grep -oE 'Backfill incomplete[^"]*' /tmp/qidian-neg.txt | head -1
fi
$PSQL -c "select to_regclass('public.lines') as lines_table_after_abort_should_be_null;"

banner "done"
