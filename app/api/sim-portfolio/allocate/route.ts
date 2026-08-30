import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/session";
import {
  getLatestSimulationRunForLine,
  getSimPortfolio,
  getHistoricalDates,
  getPricesOnDate,
  getPricesForDates,
  createSimPortfolio,
  isNotConfigured,
} from "@/lib/db";
import {
  isTickerId,
  computeInitialHoldings,
  pickRandomStartIndex,
  firstIndexWithAllTickers,
  dateAtIndex,
  STARTING_CASH,
  type Allocation,
} from "@/lib/sims/historicalReplay";
import { loadSimPortfolioView, toClientView } from "@/lib/simPortfolioModel";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const raw = (body as Record<string, unknown>)?.allocations;
  if (!Array.isArray(raw)) {
    return NextResponse.json({ error: "invalid_allocations" }, { status: 400 });
  }
  const allocations: Allocation[] = [];
  let total = 0;
  for (const item of raw) {
    const a = item as Record<string, unknown>;
    if (!isTickerId(a.ticker)) return NextResponse.json({ error: "invalid_ticker" }, { status: 400 });
    const amount = Number(a.amount);
    if (!Number.isFinite(amount) || amount < 0) {
      return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
    }
    allocations.push({ ticker: a.ticker, amount });
    total += amount;
  }
  if (total > STARTING_CASH) {
    return NextResponse.json({ error: "over_budget" }, { status: 400 });
  }

  try {
    const student = await getCurrentStudent();
    if (!student) return NextResponse.json({ error: "no_session" }, { status: 401 });

    const touziRun = await getLatestSimulationRunForLine(student.id, "touzi");
    if (!touziRun) return NextResponse.json({ error: "not_unlocked" }, { status: 403 });

    const existing = await getSimPortfolio(student.id);
    if (existing) return NextResponse.json({ error: "already_allocated" }, { status: 409 });

    const dates = await getHistoricalDates();
    if (dates.length === 0) {
      return NextResponse.json({ error: "no_price_data" }, { status: 503 });
    }
    // A newly-listed ticker can start a few days into the seed window — only
    // check a small prefix (not the whole table) to find the first date
    // every ticker has a price, so a random start never picks a date where
    // one ticker would silently be unavailable to invest in.
    const prefixPrices = await getPricesForDates(dates.slice(0, 60));
    const minStartIndex = firstIndexWithAllTickers(dates, prefixPrices);
    const startIndex = pickRandomStartIndex(dates, minStartIndex);
    const startDate = dateAtIndex(dates, startIndex)!;
    const day0Prices = await getPricesOnDate(startDate);
    const { holdings, cashBalance } = computeInitialHoldings(allocations, day0Prices);

    await createSimPortfolio({
      student_id: student.id,
      sim_start_date: startDate,
      holdings,
      cash_balance: cashBalance,
    });

    const view = await loadSimPortfolioView(student.id);
    return NextResponse.json({ view: view ? toClientView(view) : null });
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json({ error: "backend_not_configured" }, { status: 503 });
    }
    console.error("sim-portfolio allocate failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
