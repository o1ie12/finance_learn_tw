/**
 * Server-side helper for PriceChart materials whose content sets `source`
 * instead of a series (投資線 Task C, 04 §7). It reads lib/lifeGame/prices.ts,
 * which imports the large SEED_ROWS, so call it from server code only and
 * pass the prepared data to the client. Never add 'use client' here.
 *
 * Data: the split-adjusted TWSE monthly closes in lib/historicalPricesSeed.ts
 * (a month's close is its last trading day's close).
 */

import { biggestMonthlyFall, seriesFor, type Fund, type MonthlyClose } from "@/lib/lifeGame/prices";
import type { Material, PriceChartData } from "@/lib/tasks/types";

const FUND: Record<"0050" | "0056", Fund> = { "0050": "etfBroad", "0056": "etfDividend" };

/** The window and the months after it. */
export interface BiggestFallWindow {
  /** The `months` months ending at the drop month (inclusive). */
  series: MonthlyClose[];
  /** YYYY-MM of the biggest monthly fall that still has `minLater` later months. */
  markMonth: string;
  /** The drop month's change, e.g. -0.123 for −12.3%. */
  change: number;
  /** The `minLater` months after the drop (for the after-answer screen). */
  after: MonthlyClose[];
}

export function biggestFallWindow(
  ticker: "0050" | "0056",
  months = 12,
  minLater = 6,
): BiggestFallWindow {
  const fund = FUND[ticker];
  const all = seriesFor(fund);
  const fall = biggestMonthlyFall(fund, minLater);
  return {
    series: all.slice(Math.max(0, fall.index - months + 1), fall.index + 1),
    markMonth: fall.month,
    change: fall.change,
    after: all.slice(fall.index + 1, fall.index + 1 + minLater),
  };
}

/** Fill an empty `series` from `source`; data that already has a series passes through. */
export function preparePriceChart(data: PriceChartData): PriceChartData {
  if (data.series.length > 0 || !data.source) return data;
  if (data.source.window !== "biggestFall12") return data;
  const w = biggestFallWindow(data.source.ticker, 12, 6);
  return { ...data, series: w.series, markMonth: data.markMonth ?? w.markMonth };
}

/** Prepare a task's materials on the server before handing them to the client. */
export function prepareMaterials(materials: Material[]): Material[] {
  return materials.map((m) => (m.kind === "priceChart" ? { ...m, data: preparePriceChart(m.data) } : m));
}
