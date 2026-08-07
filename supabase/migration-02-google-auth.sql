-- Migration 02: optional Google Sign-in, additive and backward-compatible.
-- Safe to run against the live DB — existing code-based accounts are
-- untouched (access_code stays populated, google_uid/google_email stay
-- null for them) and the code-only sign-in flow keeps working exactly as
-- before.
--
-- google_uid stores Supabase Auth's stable per-identity user id for the
-- linked Google account (not the code-based access_code, and not Google's
-- raw `sub` — see the PR description for why).

alter table public.students
  add column if not exists google_uid text,
  add column if not exists google_email text;

-- access_code was NOT NULL; a Google-only account (no code) needs it
-- nullable. Existing rows are unaffected — they already have a value.
alter table public.students
  alter column access_code drop not null;

-- Re-declare access_code's uniqueness as a named constraint so it survives
-- alongside the new google_uid uniqueness below (Postgres allows multiple
-- NULLs in a unique column, so accounts with no code / no Google link don't
-- collide with each other).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'students_google_uid_key'
  ) then
    alter table public.students add constraint students_google_uid_key unique (google_uid);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'students_has_auth_method'
  ) then
    alter table public.students
      add constraint students_has_auth_method
      check (access_code is not null or google_uid is not null);
  end if;
end $$;
