import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/session";
import { updateSimPortfolio, isNotConfigured } from "@/lib/db";
import { loadSimPortfolioView, toClientView } from "@/lib/simPortfolioModel";

export const runtime = "nodejs";

export async function POST() {
  try {
    const student = await getCurrentStudent();
    if (!student) return NextResponse.json({ error: "no_session" }, { status: 401 });

    const view = await loadSimPortfolioView(student.id);
    if (!view) return NextResponse.json({ error: "no_portfolio" }, { status: 404 });
    if (!view.revealEligible) {
      return NextResponse.json({ error: "not_eligible_yet" }, { status: 403 });
    }

    await updateSimPortfolio(student.id, { revealed: true });
    const updatedView = await loadSimPortfolioView(student.id);
    return NextResponse.json({ view: updatedView ? toClientView(updatedView) : null });
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json({ error: "backend_not_configured" }, { status: 503 });
    }
    console.error("sim-portfolio reveal failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
