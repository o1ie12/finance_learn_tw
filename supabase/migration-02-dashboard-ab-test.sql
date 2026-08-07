-- TEMPORARY pilot: dashboard map-vs-card-grid A/B test.
-- Adds a one-time "has this student seen the comparison screen" flag.
-- See components/DashboardABTest.tsx and ENABLE_DASHBOARD_AB_TEST
-- (app/dashboard/page.tsx, lib/config.ts). Additive and safe to run on the
-- live database before deploying.
--
-- Follow-up: once the pilot group's feedback picks a winning design, this
-- column (and the feature it supports) can be dropped entirely.
--
-- Run once in the Supabase SQL editor.

alter table public.students
  add column if not exists seen_ab_dashboard_test boolean not null default false;
