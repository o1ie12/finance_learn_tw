-- Down for migration-22. Deploy code that does not write students.avatar
-- first. Every saved avatar is lost; students see the creator again.
begin;
alter table public.students drop column if exists avatar;
commit;
