/**
 * 歷史回放投資模擬 (spec section 2b) — pure compute over historical_prices +
 * sim_portfolios rows. A student is silently assigned a real historical
 * starting point, allocates a fixed sum across five ETFs, and watches it
 * play out via a drip-feed: each real calendar day unlocks a few simulated
 * days of pre-loaded price data. No live feed, no scheduled job — just a
 * last_advanced_at timestamp check on page load (see advanceDripFeed).
 *
 * Seed data: the historical_prices this ships with (lib/historicalPricesSeed.ts)
 * is real — TWSE official daily closes (see that file's header for sources/
 * licensing). The shared window is bounded by 006208's 2012-07-17 listing
 * date, the youngest ticker in this lineup — reaches 2020 (COVID crash) and
 * 2022 (rate-hike selloff), not 2008 (that would need 006208 gone too; see
 * EVENT_WINDOWS below for what this window does cover).
 *
 * Originally six ETFs, one a bond ETF (00679B) for diversification. Dropped
 * three — 00929, 00878, 00679B — after checking actual listing dates: all
 * three (2023, ~2020, 2017) capped the window far short of the original
 * multi-decade goal, and Taiwan-listed bond ETFs as a category only reach
 * back to ~2017 (no domestic bond ETF market; everything in that category
 * tracks foreign bonds), so there's no bond ETF that fixes this — the
 * bond-diversification slot was dropped entirely, not replaced.
 */

export type TickerId = "0050" | "0056" | "006208" | "0051" | "0055";

export interface TickerMeta {
  id: TickerId;
  name: string;
  note?: string; // shown in the UI — what makes this one worth including
}

export const TICKERS: TickerMeta[] = [
  { id: "0050", name: "元大台灣50" },
  { id: "0056", name: "元大高股息" },
  {
    id: "006208",
    name: "富邦台50",
    note: "追蹤跟 0050 相同的指數——兩者費用率其實很接近，不是哪支明顯比較便宜",
  },
  {
    id: "0051",
    name: "元大中型100",
    note: "0050 是市值前 50 大，這支是接下來的 100 家——跟 0050 不是同一批公司",
  },
  {
    id: "0055",
    name: "元大MSCI金融",
    note: "只集中在金融股，跟其他幾支的產業組成不一樣",
  },
];

export function isTickerId(v: unknown): v is TickerId {
  return TICKERS.some((t) => t.id === v);
}

export const STARTING_CASH = 100_000; // NT$ — simulated, never real money
export const REVEAL_MIN_SIM_DAYS = 30;
export const REVEAL_AUTO_SIM_DAYS = 365;
export const DRIP_MIN_DAYS = 7;
export const DRIP_MAX_DAYS = 14;
export const DRIP_INTERVAL_MS = 24 * 60 * 60 * 1000; // one real day

export type Holdings = Record<string, number>; // ticker -> units

export interface Allocation {
  ticker: TickerId;
  amount: number; // NT$, out of STARTING_CASH
}

/** Turn a starting allocation into initial holdings (units), at day-0 prices. */
export function computeInitialHoldings(
  allocations: Allocation[],
  day0Prices: Record<string, number>,
): { holdings: Holdings; cashBalance: number } {
  const holdings: Holdings = {};
  let spent = 0;
  for (const a of allocations) {
    const price = day0Prices[a.ticker];
    if (!price || a.amount <= 0) continue;
    holdings[a.ticker] = (holdings[a.ticker] ?? 0) + a.amount / price;
    spent += a.amount;
  }
  return { holdings, cashBalance: STARTING_CASH - spent };
}

/** How many simulated days should now be unlocked, given how much real time
 * has passed since the last advance. Deterministic given the inputs — the
 * "roughly 7-14" range in the spec is resolved by a fixed, seeded-by-date
 * formula rather than Math.random, so a page reload doesn't change the
 * answer. */
export function dripDaysForElapsed(elapsedMs: number): number {
  const realDaysElapsed = Math.floor(elapsedMs / DRIP_INTERVAL_MS);
  if (realDaysElapsed <= 0) return 0;
  let total = 0;
  for (let i = 0; i < realDaysElapsed; i++) {
    // Deterministic pseudo-variation so consecutive days don't all unlock
    // an identical amount, without needing true randomness or extra state.
    const spread = (i * 2654435761) % (DRIP_MAX_DAYS - DRIP_MIN_DAYS + 1);
    total += DRIP_MIN_DAYS + spread;
  }
  return total;
}

export interface DripFeedResult {
  newDayIndex: number;
  advanced: boolean;
}

/** Advances a simulated-day index by however many days the elapsed real time
 * unlocks, capped at maxDayIndex (the seed data's last available day). */
export function advanceDripFeed(
  currentDayIndex: number,
  lastAdvancedAtMs: number,
  nowMs: number,
  maxDayIndex: number,
): DripFeedResult {
  const elapsed = nowMs - lastAdvancedAtMs;
  const unlock = dripDaysForElapsed(elapsed);
  if (unlock <= 0) return { newDayIndex: currentDayIndex, advanced: false };
  const newDayIndex = Math.min(currentDayIndex + unlock, maxDayIndex);
  return { newDayIndex, advanced: newDayIndex !== currentDayIndex };
}

export function portfolioValue(
  holdings: Holdings,
  cashBalance: number,
  pricesAtDay: Record<string, number>,
): number {
  let value = cashBalance;
  for (const [ticker, units] of Object.entries(holdings)) {
    const price = pricesAtDay[ticker];
    if (price) value += units * price;
  }
  return value;
}

/** Even-split buy-and-hold benchmark: STARTING_CASH divided equally across
 * all five tickers at day 0, held with no rebalancing. */
export function benchmarkValue(
  day0Prices: Record<string, number>,
  pricesAtDay: Record<string, number>,
): number {
  const perTicker = STARTING_CASH / TICKERS.length;
  let value = 0;
  for (const t of TICKERS) {
    const p0 = day0Prices[t.id];
    const pNow = pricesAtDay[t.id];
    if (!p0 || !pNow) continue;
    value += (perTicker / p0) * pNow;
  }
  return value;
}

export function dayIndexOf(dates: string[], date: string): number {
  return dates.indexOf(date);
}

export function dateAtIndex(dates: string[], index: number): string | null {
  return dates[index] ?? null;
}

/** Picks a starting date index uniformly at random from the range where a
 * full REVEAL_AUTO_SIM_DAYS runway is available — "enough runway ahead for
 * a full simulation," per the spec — and where every ticker actually has a
 * price (see minIndex). The current five all list before this seed data's
 * start date, so minIndex is a no-op today; kept as a safety net in case a
 * future lineup change reintroduces a ticker that joins partway through the
 * window — picking before that would silently drop its allocation to cash
 * instead of investing it, and skew the even-split benchmark. */
export function pickRandomStartIndex(dates: string[], minIndex = 0): number {
  const lastValidStart = dates.length - 1 - REVEAL_AUTO_SIM_DAYS;
  if (lastValidStart <= minIndex) return minIndex;
  return minIndex + Math.floor(Math.random() * (lastValidStart - minIndex + 1));
}

/** The first date index where every ticker in `tickers` has a price —
 * the earliest safe value for pickRandomStartIndex's minIndex. */
export function firstIndexWithAllTickers(
  dates: string[],
  pricesByDate: Record<string, Record<string, number>>,
  tickers: TickerId[] = TICKERS.map((t) => t.id),
): number {
  for (let i = 0; i < dates.length; i++) {
    const prices = pricesByDate[dates[i]];
    if (prices && tickers.every((t) => prices[t] !== undefined)) return i;
  }
  return 0;
}

export function revealEligible(simDayIndex: number): boolean {
  return simDayIndex >= REVEAL_MIN_SIM_DAYS;
}

export function revealRequired(simDayIndex: number): boolean {
  return simDayIndex >= REVEAL_AUTO_SIM_DAYS;
}

// ---------------------------------------------------------------------------
// Named events — matched against the student's real sim_start_date/end date
// at reveal time. Kept short and only added when there's real confidence in
// the attribution; better to show no name than a wrong one.
// ---------------------------------------------------------------------------
export interface EventWindow {
  startDate: string;
  endDate: string;
  name: string;
}

export const EVENT_WINDOWS: EventWindow[] = [
  {
    // 2025-04-02 "Liberation Day" reciprocal-tariff announcement and the
    // global equity selloff that followed. Visible in the seed data as a
    // sharp multi-day drop across every ETF in the lineup (0050 -17% over
    // three trading days) — a real event in the data, not a scripted one.
    startDate: "2025-04-03",
    endDate: "2025-04-09",
    name: "你經歷的是 2025 年 4 月的關稅衝擊——美國宣布對等關稅後，全球股市在幾天內劇烈下跌。",
  },
];

export function namedEventForWindow(startDate: string, endDate: string): string | null {
  const match = EVENT_WINDOWS.find((e) => !(e.endDate < startDate || e.startDate > endDate));
  return match?.name ?? null;
}
