#!/usr/bin/env bash
# Build a local Postgres that mirrors production's schema state, for
# developing against a real database instead of the file store.
#
# Rebuilds from scratch every run: drops qidian_dev, applies schema.sql, the
# fixtures, and the migrations that are live in production. Safe to re-run.
#
# Prerequisites: postgresql@16 and postgrest (brew).
# Afterwards: supabase/local/start-local-api.sh, then point .env.local at it.
set -euo pipefail

export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SUPA="$(dirname "$HERE")"
DB="${DB:-qidian_dev}"
P="psql -X -q -v ON_ERROR_STOP=1 -d $DB"

echo "rebuilding $DB"
dropdb --if-exists "$DB"
createdb "$DB"

$P -f "$SUPA/schema.sql"
$P -f "$SUPA/test/fixture-seed.sql"

# Everything the code on this branch expects. Production is usually a little
# behind — that is fine and expected while a feature is in development — but
# local has to be ahead, or the feature cannot be built against a real schema
# at all.
$P -f "$SUPA/migration-08-lines-identity.sql"
$P -f "$SUPA/migration-10-simulation-kind.sql"
$P -f "$SUPA/migration-11-student-mode.sql"
$P -f "$SUPA/migration-12-student-profile.sql"  # not yet applied in production
$P -f "$SUPA/migration-13-career-line.sql"     # not yet applied in production
$P -f "$SUPA/migration-14-xiaofei-title.sql"    # not yet applied in production
$P -f "$SUPA/migration-15-capstone-line.sql"   # not yet applied in production

# NOTE: migration-09 is deliberately NOT applied. It sets line_id NOT NULL,
# which is only safe once every write path supplies the column. Applying it
# here would hide exactly the failure this environment exists to catch.

$P <<'SQL'
-- Stands in for Supabase's service role, which bypasses RLS.
drop role if exists qidian_auth;
drop role if exists qidian_api;
create role qidian_api nologin bypassrls;
grant usage on schema public to qidian_api;
grant all on all tables in schema public to qidian_api;
grant all on all sequences in schema public to qidian_api;
alter default privileges in schema public grant all on tables to qidian_api;

create role qidian_auth login password 'localdev' noinherit;
grant qidian_api to qidian_auth;
SQL

echo
psql -X -d "$DB" -c "
select 'lines' t, count(*)::text n from lines
union all select 'runs', count(*)::text from simulation_runs
union all select 'runs null line_id', count(*)::text from simulation_runs where line_id is null
union all select 'runs null kind', count(*)::text from simulation_runs where kind is null
order by t;"

echo "ready. next: $HERE/start-local-api.sh"
