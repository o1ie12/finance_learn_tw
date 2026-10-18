-- The character the student builds at onboarding (Stage G, 01 §6.2-6.3).
-- Avatar parts are stored as JSON on the student; null means not built yet,
-- which is every existing row. Additive and nullable: no backfill, no rewrite.
--
-- Safe to apply before deploying the code that uses it. Idempotent.

begin;
alter table public.students add column if not exists avatar jsonb null;
commit;
