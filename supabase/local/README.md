# Running the app against real Postgres locally

The file store (`USE_DEV_STORE=1`, `.devstore.json`) is convenient but it is a
JSON array. It has no NOT NULL constraints, no column defaults and no foreign
keys, so an entire class of bug passes straight through it and only appears in
production. Two real examples from this project:

- `line_id` was added NOT NULL in the same migration that created it. Against
  the file store everything looked fine; against Postgres every insert the
  deployed app made was rejected.
- The app writes a `kind` column. Without the migration that adds it, Postgres
  errors; the file store silently accepts the extra field.

So database-shaped work is developed against Postgres, not the file store.

## Why not `supabase start`?

It needs Docker, which isn't installed here. Instead we run PostgREST — a
single binary — directly over local Postgres. `lib/db.ts` only ever calls
`.from()`, which is pure PostgREST surface, so the app's Supabase client works
against it unmodified. A small proxy bridges the one difference: the client
prefixes requests with `/rest/v1`, which PostgREST serves at the root.

```
app (:3000) → proxy (:3001) → PostgREST (:3002) → Postgres (:5432)
```

## Setup

```bash
brew install postgresql@16 postgrest
brew services start postgresql@16

./supabase/local/setup-local-db.sh      # build qidian_dev + roles
./supabase/local/start-local-api.sh &   # PostgREST on :3002
node supabase/local/proxy.mjs &         # proxy on :3001
```

Then in `.env.local`:

```
SUPABASE_URL=http://localhost:3001
SUPABASE_SERVICE_ROLE_KEY=local-dev-placeholder
```

The key is a placeholder: `jwt-secret` is unset, and the proxy strips the auth
headers, so every request runs as a BYPASSRLS role standing in for Supabase's
service role. RLS is enabled with no policies on every table, so without that
role the app would read empty tables and write nothing.

**The production `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` lines in
`.env.local` stay commented out.** Uncommenting them points local development
at the live pilot database.

## Which migrations to apply locally

`setup-local-db.sh` applies only what is live in production. Adding one before
it ships there would mean developing against a schema the real database does
not have — and in the case of `migration-09` specifically, it would hide the
exact failure this environment exists to catch.

## Reverting to the file store

```bash
cp .env.local.bak-before-localpg .env.local
```
