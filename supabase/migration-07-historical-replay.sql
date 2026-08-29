-- 2b. Historical replay investing simulator (spec section 2b).
--
-- historical_prices is meant to be seeded ONCE from real historical data
-- (TWSE or a licensed data provider, source terms verified) — static, no
-- ongoing fetch. The seed data currently shipped with this app
-- (lib/historicalPricesSeed.ts, loaded by scripts/seed-historical-prices.ts)
-- is SYNTHETIC PLACEHOLDER DATA, not real TWSE prices — see that file's
-- header for why, and swap it for a verified real source before this
-- feature reaches real students. This migration only creates the tables.
--
-- Additive. Run once in the Supabase SQL editor, after migration-06.

create table if not exists public.historical_prices (
  ticker         text not null,
  date           date not null,
  closing_price  numeric not null,
  primary key (ticker, date)
);

create index if not exists historical_prices_ticker_date_idx
  on public.historical_prices (ticker, date);

-- One portfolio per student. sim_start_date is the real historical date the
-- student was silently assigned and is never shown to them until reveal.
-- holdings is ticker -> units (fractional allowed). last_advanced_at drives
-- the drip-feed: on each dashboard load, if now() - last_advanced_at > 24h,
-- sim_current_date advances by a fixed simulated increment.
create table if not exists public.sim_portfolios (
  student_id       uuid primary key references public.students (id) on delete cascade,
  sim_start_date   date not null,
  sim_current_date date not null,
  holdings         jsonb not null default '{}'::jsonb,
  cash_balance     numeric not null default 0,
  last_advanced_at timestamptz not null default now(),
  revealed         boolean not null default false,
  created_at       timestamptz not null default now()
);

alter table public.historical_prices enable row level security;
alter table public.sim_portfolios    enable row level security;
