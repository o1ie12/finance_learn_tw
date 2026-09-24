#!/usr/bin/env bash
# Serve the local Postgres through PostgREST, so the app's Supabase client
# talks to a real database. Run setup-local-db.sh first.
#
# Then in .env.local:
#   SUPABASE_URL=http://localhost:3001
#   SUPABASE_SERVICE_ROLE_KEY=local-dev-placeholder
#
# The key is a placeholder on purpose: jwt-secret is unset in postgrest.conf,
# so the header is ignored and every request runs as the BYPASSRLS role. Any
# non-empty string works — lib/db.ts only checks that both vars are set before
# choosing the supabase backend over the file store.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"

if ! pg_isready -q 2>/dev/null; then
  echo "Postgres is not running. Start it with:"
  echo "  brew services start postgresql@16"
  exit 1
fi

echo "PostgREST on http://localhost:3001 (ctrl-c to stop)"
exec postgrest "$HERE/postgrest.conf"
