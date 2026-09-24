-- A small, growing set of facts about a student that outlive any one line.
--
-- Why jsonb rather than a column per fact, the way students.mode is stored:
--
-- mode is a closed enum the app branches on everywhere, so a typed column
-- with a check constraint is right — an invalid value should be impossible at
-- the database level. The profile is the opposite shape. It is explicitly
-- expected to grow (interest and income now; more as other lines start
-- reading it), and adding a field must not mean a migration each time. A
-- column per fact would make every new one a schema change.
--
-- The precedent for flexible per-student data is already here:
-- simulation_runs.spending_choices and outcome_summary are both jsonb.
--
-- The risk in copying that is equally well established. Free-form jsonb read
-- by field name across several consumers is exactly what let the coach, the
-- stamp and the certificate drift onto a shape that no longer existed. So the
-- flexibility stops at the database: lib/studentProfile.ts validates this
-- column against a schema on the way in and on the way out, and lines read
-- named fields through it rather than reaching into the jsonb themselves.
-- Flexible storage, contracted access.
--
-- Additive, defaulted, and safe to run while the app serves.

begin;

alter table public.students
  add column if not exists profile jsonb not null default '{}'::jsonb;

comment on column public.students.profile is
  'Cross-line facts about the student (interest bucket, resolved income). Read and written only via lib/studentProfile.ts, which validates the shape. Not a place for a single line''s simulation results — those live in simulation_runs.';

commit;
