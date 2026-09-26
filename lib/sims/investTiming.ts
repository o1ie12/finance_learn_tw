import { SEED_ROWS } from "@/lib/historicalPricesSeed";
import type { TickerId } from "@/lib/sims/historicalReplay";

/**
 * 定期定額 vs 一次投入, computed against real prices.
 *
 * Station 8 teaches the difference; until now the simulation offered only a
 * lump sum, so the station taught a decision the terminal never asked for.
 * This takes the student's actual starting sum and values BOTH strategies
 * over the same real window from the TWSE closes this repo already ships
 * (lib/historicalPricesSeed.ts) — the same data the historical replay uses.
 *
 * Neither result is a recommendation. Whichever came out ahead did so
 * because of what prices did inside this one window, which nobody could
 * have known on day one. That is the lesson, and the UI is written to keep
 * it that way rather than resolving it into "so do this".
 *
 * The window is the most recent full year the data covers. It is stated on
 * screen. It was not chosen to make either strategy look good.
 */

export type InvestTiming = "lump" | "dca";

export const TIMING_OPTIONS: Array<{
  id: InvestTiming;
  label: string;
  blurb: string;
}> = [
  {
    id: "lump",
    label: "一次投入",
    blurb: "第一天就把整筆錢買進去。之後漲跌都是整筆在承受。",
  },
  {
    id: "dca",
    label: "定期定額",
    blurb: "分成十二個月，每月買一份。買到的價格是這一年的平均，不是某一天。",
  },
];

export function isInvestTiming(v: unknown): v is InvestTiming {
  return v === "lump" || v === "dca";
}

/** Latest full year the seed covers; the seed ends 2026-08-28. */
export const TIMING_WINDOW = { from: "2025-08-28", to: "2026-08-28" } as const;

export const DCA_TRANCHES = 12;

interface Close {
  date: string;
  price: number;
}

const closesByTicker = new Map<TickerId, Close[]>();

function closesFor(ticker: TickerId): Close[] {
  let list = closesByTicker.get(ticker);
  if (!list) {
    list = SEED_ROWS.filter((r) => r.ticker === ticker)
      .map((r) => ({ date: r.date, price: r.closing_price }))
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    closesByTicker.set(ticker, list);
  }
  return list;
}

/** First trading day on or after `date`, or null past the end of data. */
function tradingDayOnOrAfter(list: Close[], date: string): Close | null {
  for (const c of list) if (c.date >= date) return c;
  return null;
}

/** Last trading day on or before `date`. */
function tradingDayOnOrBefore(list: Close[], date: string): Close | null {
  let last: Close | null = null;
  for (const c of list) {
    if (c.date > date) break;
    last = c;
  }
  return last;
}

/** The same calendar day `n` months after an ISO date, clamped to the 28th. */
function addMonths(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const total = y * 12 + (m - 1) + n;
  const yy = Math.floor(total / 12);
  const mm = (total % 12) + 1;
  const dd = Math.min(d, 28);
  return `${yy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

export interface TimingLeg {
  invested: number;
  units: number;
  finalValue: number;
  /** Average price paid per unit. */
  avgPrice: number;
}

export interface TimingComparison {
  ticker: TickerId;
  from: string;
  to: string;
  startPrice: number;
  endPrice: number;
  lump: TimingLeg;
  dca: TimingLeg;
  /** Number of monthly purchases the DCA leg actually made. */
  dcaTranches: number;
  /** Which came out ahead in THIS window. "same" within NT$1. */
  betterInHindsight: InvestTiming | "same";
}

/**
 * Value a lump-sum purchase on the window's first trading day and a monthly
 * DCA across the window, both at the window's last trading day.
 */
export function compareTiming(
  ticker: TickerId,
  amount: number,
  window: { from: string; to: string } = TIMING_WINDOW,
): TimingComparison | null {
  const list = closesFor(ticker);
  const first = tradingDayOnOrAfter(list, window.from);
  const last = tradingDayOnOrBefore(list, window.to);
  if (!first || !last || first.date >= last.date || amount <= 0) return null;

  const lumpUnits = amount / first.price;
  const lump: TimingLeg = {
    invested: amount,
    units: lumpUnits,
    finalValue: Math.round(lumpUnits * last.price),
    avgPrice: first.price,
  };

  const tranche = amount / DCA_TRANCHES;
  let dcaUnits = 0;
  let dcaInvested = 0;
  let tranches = 0;
  for (let i = 0; i < DCA_TRANCHES; i++) {
    const day = tradingDayOnOrAfter(list, addMonths(window.from, i));
    if (!day || day.date > last.date) break;
    dcaUnits += tranche / day.price;
    dcaInvested += tranche;
    tranches++;
  }
  const dca: TimingLeg = {
    invested: Math.round(dcaInvested),
    units: dcaUnits,
    finalValue: Math.round(dcaUnits * last.price),
    avgPrice: dcaUnits > 0 ? dcaInvested / dcaUnits : first.price,
  };

  const diff = lump.finalValue - dca.finalValue;
  return {
    ticker,
    from: first.date,
    to: last.date,
    startPrice: first.price,
    endPrice: last.price,
    lump,
    dca,
    dcaTranches: tranches,
    betterInHindsight: Math.abs(diff) <= 1 ? "same" : diff > 0 ? "lump" : "dca",
  };
}
