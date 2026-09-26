-- Split-adjust 0050 in historical_prices: divide every close before
-- 2025-06-18 by 4.
--
-- 元大台灣50 split 1-for-4, trading resumed 2025-06-18 (last pre-split close
-- 188.65, TWSE reference price 47.16). The table was seeded from TWSE's raw
-- closes, which report a split as an overnight price drop, so any replay
-- window crossing that date showed a 75% one-day loss that never happened.
-- The code seed (lib/historicalPricesSeed.ts) now applies the same
-- adjustment at load, so a future re-seed writes continuous values; this
-- brings the already-seeded table into line.
--
-- IDEMPOTENT by construction, not by convention. Dividing an already-adjusted
-- series again would corrupt it silently, so the update only runs if the
-- LAST row before the split still holds a raw close (> 100). After one run
-- that row reads ~47 and the guard is false forever. Two things this guard
-- deliberately does not do: key on a fixed calendar date (2025-06-17 is not
-- a trading day in the series, so that lookup finds nothing and would skip
-- the whole adjustment), and test every row by value (0050 traded near 50
-- in 2012, which collides with post-split prices).
--
-- Data-only. Safe to run at any time; ~3,100 rows updated once.

begin;

do $$
declare pre_split numeric;
begin
  select closing_price into pre_split
    from public.historical_prices
   where ticker = '0050' and date < '2025-06-18'
   order by date desc
   limit 1;

  if pre_split is null then
    raise notice 'historical_prices has no 0050 rows before 2025-06-18 — table not seeded; nothing to adjust.';
  elsif pre_split < 100 then
    raise notice '0050 already split-adjusted (last pre-split close = %); skipping.', pre_split;
  else
    update public.historical_prices
       set closing_price = round(closing_price / 4, 2)
     where ticker = '0050' and date < '2025-06-18';
    raise notice '0050 pre-split closes divided by 4 (last pre-split close was %).', pre_split;
  end if;
end $$;

commit;
