import type { SeedRow, SplitAdjustment } from "@/lib/historicalPricesSeed";

/**
 * Mechanical checks on the price seed, run by scripts/check-sim-contract.ts.
 *
 * The bug class is "a new entry slips in unchecked": TWSE reports a split as
 * an overnight price drop, and the first time anyone noticed 0050's was when
 * a 定期定額 comparison happened to look near it. These make the seed refuse
 * to pass with such a jump in it, the way the contract script's A0 guard
 * refuses to pass with an unchecked line.
 */

/**
 * TWSE enforces a ±10% daily limit on listed shares and ETFs, and the seed's
 * own worst genuine days sit exactly at 10.0% (the 2025-04-07 tariff crash
 * and the 04-10 rebound). 25% is two and a half times that — comfortably
 * clear of any real day, and comfortably inside the smallest split ratio
 * anyone announces (1-for-2 is a 50% drop).
 */
export const MAX_PLAUSIBLE_DAILY_MOVE = 0.25;

export interface Discontinuity {
  ticker: string;
  date: string;
  prevDate: string;
  prevClose: number;
  close: number;
  move: number; // fractional, e.g. -0.748
}

/** Every adjacent-day move beyond the threshold, per ticker. */
export function findDiscontinuities(
  rows: SeedRow[],
  threshold = MAX_PLAUSIBLE_DAILY_MOVE,
): Discontinuity[] {
  const byTicker = new Map<string, SeedRow[]>();
  for (const r of rows) {
    const list = byTicker.get(r.ticker) ?? [];
    list.push(r);
    byTicker.set(r.ticker, list);
  }
  const out: Discontinuity[] = [];
  for (const [ticker, list] of byTicker) {
    list.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    for (let i = 1; i < list.length; i++) {
      const prev = list[i - 1];
      const cur = list[i];
      if (prev.closing_price <= 0) continue;
      const move = cur.closing_price / prev.closing_price - 1;
      if (Math.abs(move) > threshold) {
        out.push({
          ticker,
          date: cur.date,
          prevDate: prev.date,
          prevClose: prev.closing_price,
          close: cur.closing_price,
          move,
        });
      }
    }
  }
  return out;
}

export interface SplitReconciliation {
  ticker: string;
  effectiveDate: string;
  factor: number;
  lastRawPreSplit: number;
  impliedPostSplit: number; // lastRawPreSplit / factor
  firstRawPostSplit: number;
  /** |implied − first post| / first post. Should be a normal day's move. */
  gap: number;
  ok: boolean;
}

/**
 * Confirms each declared split actually matches the raw data: the last raw
 * pre-split close divided by the announced factor should land within an
 * ordinary day's move of the first raw post-split close. This is the check
 * the spec asked for — the factor comes from the announcement, and the seed
 * is verified against it, never the other way round.
 */
export function reconcileSplits(
  raw: SeedRow[],
  adjustments: SplitAdjustment[],
  tolerance = 0.1,
): SplitReconciliation[] {
  return adjustments.map((adj) => {
    const series = raw
      .filter((r) => r.ticker === adj.ticker)
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    const pre = [...series].reverse().find((r) => r.date < adj.effectiveDate);
    const post = series.find((r) => r.date >= adj.effectiveDate);
    const lastRawPreSplit = pre?.closing_price ?? NaN;
    const firstRawPostSplit = post?.closing_price ?? NaN;
    const impliedPostSplit = lastRawPreSplit / adj.factor;
    const gap = Math.abs(impliedPostSplit - firstRawPostSplit) / firstRawPostSplit;
    return {
      ticker: adj.ticker,
      effectiveDate: adj.effectiveDate,
      factor: adj.factor,
      lastRawPreSplit,
      impliedPostSplit,
      firstRawPostSplit,
      gap,
      ok: Number.isFinite(gap) && gap <= tolerance,
    };
  });
}
