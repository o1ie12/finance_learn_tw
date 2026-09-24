-- Item 2 — store the result-shape discriminant alongside the result.
--
-- outcome_summary is free-form jsonb, and several features read it back by
-- field name. Until now the only clue to its shape was line_slug, which is
-- not the same thing: when 信用線's simulation was replaced, the slug stayed
-- 'xinyong' while the stored shape changed completely, so old housing rows
-- and new credit-card rows became indistinguishable. Three consumers read the
-- new rows with the old field names and rendered NT$0 figures.
--
-- `kind` names the shape and carries a version, so replacing a simulation
-- mints a new kind and leaves history readable as what it actually is.
--
-- Nullable on purpose. Rows this migration cannot confidently classify keep a
-- null kind and render a neutral state — never a guessed number.
--
-- Safe to run while the app serves: existing code ignores the column.

begin;

alter table public.simulation_runs add column if not exists kind text;

comment on column public.simulation_runs.kind is
  'Shape of outcome_summary, versioned (e.g. xinyong_credit_card_v1). NOT the line — a line mints a new kind when its simulation is replaced. Null means unclassifiable; render a neutral state. See lib/sims/types.ts.';

-- Backfill history. Every line except 信用線 maps straight from its slug,
-- because its simulation has not been replaced.
update public.simulation_runs set kind = 'qixin_salary_v1'        where line_slug = 'qixin'    and kind is null;
update public.simulation_runs set kind = 'cunqian_savings_v1'     where line_slug = 'cunqian'  and kind is null;
update public.simulation_runs set kind = 'touzi_investing_v1'     where line_slug = 'touzi'    and kind is null;
update public.simulation_runs set kind = 'zhapian_fraud_v1'       where line_slug = 'zhapian'  and kind is null;
update public.simulation_runs set kind = 'xuedai_student_loan_v1' where line_slug = 'xuedai'   and kind is null;
update public.simulation_runs set kind = 'baoshui_tax_v1'         where line_slug = 'baoshui'  and kind is null;
update public.simulation_runs set kind = 'zuwu_lease_v1'          where line_slug = 'zuwu'     and kind is null;
update public.simulation_runs set kind = 'baoxian_sales_pitch_v1' where line_slug = 'baoxian'  and kind is null;
update public.simulation_runs set kind = 'chuangye_bubble_tea_v1' where line_slug = 'chuangye' and kind is null;

-- 信用線 is the one line with two shapes in its history. Distinguish them by
-- a field only one of them has, rather than by date — a date cutoff would
-- depend on knowing exactly when the swap deployed, and would silently
-- mislabel anything either side of it.
update public.simulation_runs
   set kind = 'xinyong_credit_card_v1'
 where line_slug = 'xinyong' and kind is null
   and outcome_summary ? 'totalInterest';

update public.simulation_runs
   set kind = 'xinyong_housing_v1'
 where line_slug = 'xinyong' and kind is null
   and outcome_summary -> 'chosen' ? 'leftover';

-- Anything still null here is a row neither pattern matched. Left as null
-- deliberately: a neutral "cannot display" is correct, and inventing a kind
-- for it would recreate the exact bug this column exists to prevent.
do $$
declare unclassified integer;
begin
  select count(*) into unclassified from public.simulation_runs where kind is null;
  if unclassified > 0 then
    raise notice
      '% run(s) could not be classified and keep a null kind. They will render a neutral state. Inspect with: select id, line_slug, jsonb_object_keys(outcome_summary) from simulation_runs where kind is null;',
      unclassified;
  end if;
end $$;

create index if not exists simulation_runs_kind_idx
  on public.simulation_runs (kind);

commit;
