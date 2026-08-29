import "server-only";
import {
  getHistoricalDates,
  getPricesOnDate,
  getPricesForDates,
  getSimPortfolio,
  updateSimPortfolio,
} from "@/lib/db";
import {
  advanceDripFeed,
  dayIndexOf,
  dateAtIndex,
  portfolioValue,
  benchmarkValue,
  revealEligible,
  revealRequired,
  namedEventForWindow,
} from "@/lib/sims/historicalReplay";
import type { SimPortfolio } from "@/lib/types";

export interface SimPortfolioView {
  portfolio: SimPortfolio;
  simDayIndex: number;
  value: number;
  benchmarkValue: number;
  revealEligible: boolean;
  revealRequired: boolean;
  sparkline: { dayIndex: number; value: number; benchmark: number }[];
  // Real dates and named event — undefined pre-reveal so the client never
  // has to be trusted not to render them early.
  revealData?: { startDate: string; endDate: string; namedEvent: string | null };
}

/**
 * Runs the drip-feed advance (if due) and builds the full view for a
 * student's portfolio. Called on every dashboard/portfolio page load —
 * the advance check itself is just a timestamp comparison, so this is
 * cheap even when nothing needs to move.
 */
export async function loadSimPortfolioView(studentId: string): Promise<SimPortfolioView | null> {
  let portfolio = await getSimPortfolio(studentId);
  if (!portfolio) return null;

  const dates = await getHistoricalDates();
  const maxIndex = dates.length - 1;
  const startIndex = dayIndexOf(dates, portfolio.sim_start_date);
  let currentIndex = dayIndexOf(dates, portfolio.sim_current_date);

  const drip = advanceDripFeed(
    currentIndex,
    new Date(portfolio.last_advanced_at).getTime(),
    Date.now(),
    maxIndex,
  );
  if (drip.advanced) {
    const newDate = dateAtIndex(dates, drip.newDayIndex);
    if (newDate) {
      const updated = await updateSimPortfolio(studentId, {
        sim_current_date: newDate,
        last_advanced_at: new Date().toISOString(),
      });
      if (updated) portfolio = updated;
      currentIndex = drip.newDayIndex;
    }
  }

  const simDayIndex = currentIndex - startIndex;
  const day0Prices = await getPricesOnDate(portfolio.sim_start_date);
  const currentPrices = await getPricesOnDate(portfolio.sim_current_date);
  const value = portfolioValue(portfolio.holdings, portfolio.cash_balance, currentPrices);
  const bench = benchmarkValue(day0Prices, currentPrices);

  const sparklineDates = dates.slice(startIndex, currentIndex + 1);
  const pricesByDate = await getPricesForDates(sparklineDates);
  const sparkline = sparklineDates.map((date, i) => ({
    dayIndex: i,
    value: portfolioValue(portfolio!.holdings, portfolio!.cash_balance, pricesByDate[date] ?? {}),
    benchmark: benchmarkValue(day0Prices, pricesByDate[date] ?? {}),
  }));

  const view: SimPortfolioView = {
    portfolio,
    simDayIndex,
    value,
    benchmarkValue: bench,
    revealEligible: revealEligible(simDayIndex),
    revealRequired: revealRequired(simDayIndex),
    sparkline,
  };

  if (portfolio.revealed) {
    view.revealData = {
      startDate: portfolio.sim_start_date,
      endDate: portfolio.sim_current_date,
      namedEvent: namedEventForWindow(portfolio.sim_start_date, portfolio.sim_current_date),
    };
  }

  return view;
}

/**
 * The response boundary for every /api/sim-portfolio* route. Blanks
 * sim_start_date/sim_current_date until revealed=true — those fields exist
 * on the underlying SimPortfolio for the server's own use (price lookups,
 * drip-feed math), but must never reach the client pre-reveal. Redacting
 * here, once, at the actual API response boundary is what makes "the user
 * never sees the actual date" a real guarantee rather than just a UI
 * convention a component could forget to honor.
 */
export function toClientView(view: SimPortfolioView): SimPortfolioView {
  if (view.portfolio.revealed) return view;
  return {
    ...view,
    portfolio: {
      ...view.portfolio,
      sim_start_date: "",
      sim_current_date: "",
    },
  };
}
