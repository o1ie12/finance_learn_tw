-- Reverts migration-19. Drops the version label: afterwards old and new bank
-- scores are indistinguishable again. Only run together with reverting the
-- code that writes bank_version.

begin;

alter table public.line_tests drop constraint if exists line_tests_bank_version_positive;
alter table public.line_tests drop column if exists bank_version;

commit;
