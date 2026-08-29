import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/session";
import { getPricesOnDate, updateSimPortfolio, isNotConfigured } from "@/lib/db";
import { isTickerId, type Allocation } from "@/lib/sims/historicalReplay";
import { loadSimPortfolioView, toClientView } from "@/lib/simPortfolioModel";

export const runtime = "nodejs";

// Rebalances at the portfolio's current simulated date's prices — a
// checkpoint action, not a daily one; the client only offers this when a
// portfolio already exists.
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
  let requestedTotal = 0;
  for (const item of raw) {
    const a = item as Record<string, unknown>;
    if (!isTickerId(a.ticker)) return NextResponse.json({ error: "invalid_ticker" }, { status: 400 });
    const amount = Number(a.amount);
    if (!Number.isFinite(amount) || amount < 0) {
      return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
    }
    allocations.push({ ticker: a.ticker, amount });
    requestedTotal += amount;
  }

  try {
    const student = await getCurrentStudent();
    if (!student) return NextResponse.json({ error: "no_session" }, { status: 401 });

    const view = await loadSimPortfolioView(student.id);
    if (!view) return NextResponse.json({ error: "no_portfolio" }, { status: 404 });
    if (view.portfolio.revealed) {
      return NextResponse.json({ error: "already_revealed" }, { status: 409 });
    }

    const currentTotal = view.value;
    if (requestedTotal > currentTotal + 0.01) {
      return NextResponse.json({ error: "over_budget" }, { status: 400 });
    }

    const currentPrices = await getPricesOnDate(view.portfolio.sim_current_date);
    const holdings: Record<string, number> = {};
    let spent = 0;
    for (const a of allocations) {
      const price = currentPrices[a.ticker];
      if (!price || a.amount <= 0) continue;
      holdings[a.ticker] = (holdings[a.ticker] ?? 0) + a.amount / price;
      spent += a.amount;
    }
    const cashBalance = currentTotal - spent;

    await updateSimPortfolio(student.id, { holdings, cash_balance: cashBalance });
    const updatedView = await loadSimPortfolioView(student.id);
    return NextResponse.json({ view: updatedView ? toClientView(updatedView) : null });
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json({ error: "backend_not_configured" }, { status: 503 });
    }
    console.error("sim-portfolio rebalance failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
