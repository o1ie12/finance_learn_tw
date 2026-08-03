import { NextResponse } from "next/server";
import { createSimulationRun, isNotConfigured } from "@/lib/db";
import { getCurrentStudent } from "@/lib/session";
import { computeSimulation, isValidRentChoice } from "@/lib/simulation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const rent = b?.rent;
  const tpass = Boolean(b?.tpass);
  const savingsRate = Number(b?.savingsRate);

  if (!isValidRentChoice(rent)) {
    return NextResponse.json({ error: "invalid_rent" }, { status: 400 });
  }
  if (!Number.isFinite(savingsRate) || savingsRate < 0 || savingsRate > 100) {
    return NextResponse.json({ error: "invalid_savings_rate" }, { status: 400 });
  }

  const outcome = computeSimulation({ rent, tpass, savingsRate });

  try {
    const student = await getCurrentStudent();
    if (!student) {
      return NextResponse.json({ error: "no_session" }, { status: 401 });
    }

    const run = await createSimulationRun({
      student_id: student.id,
      rent_choice: outcome.chosen.rent,
      savings_rate: outcome.savingsRate,
      spending_choices: {
        tpass: outcome.tpass,
        transitCost: outcome.transitCost,
        livingCost: outcome.livingCost,
      },
      outcome_summary: {
        net: outcome.net,
        leftover: outcome.chosen.leftover,
        deficit: outcome.chosen.deficit,
        monthlySavings: outcome.chosen.monthlySavings,
        annualSavings: outcome.chosen.annualSavings,
        rentCost: outcome.chosen.rentCost,
      },
    });

    return NextResponse.json({ run_id: run.id, outcome });
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json(
        { error: "backend_not_configured" },
        { status: 503 },
      );
    }
    console.error("simulation post failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
