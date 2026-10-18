/**
 * The ETF price path: real monthly closes, never smoothed (02 §3.4).
 *
 * Source: SEED_ROWS in lib/historicalPricesSeed.ts, the split-adjusted TWSE
 * daily closes the `historical_prices` table was seeded from (0050 adjusted
 * 1-for-4 on 2025-06-18). A month's close is its last trading day's close.
 *
 * A game picks a start month from its seed and advances one real month per
 * turn. When the series runs out it wraps to the start; the wrap multiplies
 * every later price by the ratio at the seam, so returns stay real and no
 * fake crash appears where 2026 meets 2012. Each wrap is logged in state.
 */

import { SEED_ROWS } from "@/lib/historicalPricesSeed";

export interface MonthlyClose {
  month: string; // YYYY-MM
  close: number;
}

function monthlyCloses(ticker: "0050" | "0056"): MonthlyClose[] {
  const last = new Map<string, number>();
  for (const r of SEED_ROWS) {
    if (r.ticker !== ticker) continue;
    // SEED_ROWS is date-ordered, so the last write per month is its close.
    last.set(r.date.slice(0, 7), r.closing_price);
  }
  return [...last.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([month, close]) => ({ month, close }));
}

export const BROAD_SERIES: MonthlyClose[] = monthlyCloses("0050");
export const DIVIDEND_SERIES: MonthlyClose[] = monthlyCloses("0056");

if (BROAD_SERIES.length !== DIVIDEND_SERIES.length) {
  throw new Error("0050 and 0056 monthly series must cover the same months");
}

export const SERIES_LENGTH = BROAD_SERIES.length;

export type Fund = "etfBroad" | "etfDividend";

export function seriesFor(fund: Fund): MonthlyClose[] {
  return fund === "etfBroad" ? BROAD_SERIES : DIVIDEND_SERIES;
}

export interface WrapLog {
  atTurn: number;
  scaleBroad: number;
  scaleDividend: number;
}

/** Index into the real series for a game turn (before scaling). */
export function seriesIndex(startIndex: number, turn: number): number {
  return (startIndex + turn) % SERIES_LENGTH;
}

/** The turn at which the n-th wrap happens (n = 1, 2, ...). */
function wrapTurn(startIndex: number, n: number): number {
  return SERIES_LENGTH * n - startIndex;
}

/**
 * Wraps that have happened by `turn`, computing any not yet logged. Pure:
 * the same start index always gives the same scales.
 */
export function wrapsUpTo(startIndex: number, turn: number, logged: WrapLog[]): WrapLog[] {
  const out = [...logged];
  let n = out.length + 1;
  while (wrapTurn(startIndex, n) <= turn) {
    const at = wrapTurn(startIndex, n);
    const prevBroad = out.length ? out[out.length - 1].scaleBroad : 1;
    const prevDiv = out.length ? out[out.length - 1].scaleDividend : 1;
    const lastB = BROAD_SERIES[SERIES_LENGTH - 1].close;
    const lastD = DIVIDEND_SERIES[SERIES_LENGTH - 1].close;
    // At the seam the price does not move: the first month of the next lap
    // is priced at the last month of this one.
    out.push({
      atTurn: at,
      scaleBroad: (prevBroad * lastB) / BROAD_SERIES[0].close,
      scaleDividend: (prevDiv * lastD) / DIVIDEND_SERIES[0].close,
    });
    n++;
  }
  return out;
}

/** The fund's price at a turn: the real close, scaled after any wraps. */
export function priceAt(fund: Fund, startIndex: number, turn: number, wraps: WrapLog[]): number {
  const all = wrapsUpTo(startIndex, turn, wraps);
  const active = all.filter((w) => w.atTurn <= turn);
  const scale = active.length
    ? fund === "etfBroad"
      ? active[active.length - 1].scaleBroad
      : active[active.length - 1].scaleDividend
    : 1;
  return seriesFor(fund)[seriesIndex(startIndex, turn)].close * scale;
}

/** The calendar month label of the real data behind a turn. */
export function dataMonthAt(startIndex: number, turn: number): string {
  return BROAD_SERIES[seriesIndex(startIndex, turn)].month;
}

/** Return of the month that ends at `turn + 1` (the move applied in turn `turn`). */
export function monthReturn(fund: Fund, startIndex: number, turn: number, wraps: WrapLog[]): number {
  return priceAt(fund, startIndex, turn + 1, wraps) / priceAt(fund, startIndex, turn, wraps) - 1;
}

/** The biggest single-month fall in the real series (for tests and 投資線 Task C). */
export function biggestMonthlyFall(fund: Fund = "etfBroad", minLaterMonths = 0): {
  index: number;
  month: string;
  change: number;
} {
  const s = seriesFor(fund);
  let best = { index: 1, month: s[1].month, change: s[1].close / s[0].close - 1 };
  for (let i = 1; i < s.length - minLaterMonths; i++) {
    const change = s[i].close / s[i - 1].close - 1;
    if (change < best.change) best = { index: i, month: s[i].month, change };
  }
  return best;
}
