import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/session";
import { getLatestSimulationRunForLine, isNotConfigured } from "@/lib/db";
import { loadSimPortfolioView, toClientView } from "@/lib/simPortfolioModel";

export const runtime = "nodejs";

export async function GET() {
  try {
    const student = await getCurrentStudent();
    if (!student) return NextResponse.json({ error: "no_session" }, { status: 401 });

    const touziRun = await getLatestSimulationRunForLine(student.id, "touzi");
    if (!touziRun) {
      return NextResponse.json({ error: "not_unlocked" }, { status: 403 });
    }

    const view = await loadSimPortfolioView(student.id);
    return NextResponse.json({ view: view ? toClientView(view) : null });
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json({ error: "backend_not_configured" }, { status: 503 });
    }
    console.error("sim-portfolio get failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
