import { NextResponse } from "next/server";
import {
  getSimulationRun,
  addCoachMessage,
  isNotConfigured,
} from "@/lib/db";
import { getCurrentStudent } from "@/lib/session";
import {
  computeSimulation,
  isValidRentChoice,
  type RentChoiceId,
} from "@/lib/simulation";
import { generateCoachMessage } from "@/lib/coach";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const runId = (body as Record<string, unknown>)?.run_id;
  if (typeof runId !== "string" || !runId) {
    return NextResponse.json({ error: "missing_run_id" }, { status: 400 });
  }

  try {
    const student = await getCurrentStudent();
    if (!student) {
      return NextResponse.json({ error: "no_session" }, { status: 401 });
    }

    const run = await getSimulationRun(runId);
    if (!run) {
      return NextResponse.json({ error: "run_not_found" }, { status: 404 });
    }
    // Only the owner of the run may request coaching on it.
    if (run.student_id !== student.id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    if (!isValidRentChoice(run.rent_choice)) {
      return NextResponse.json({ error: "invalid_run" }, { status: 422 });
    }
    const tpass = Boolean(
      (run.spending_choices as Record<string, unknown>)?.tpass,
    );

    // Recompute from the stored choices so the coach sees authoritative,
    // grounded numbers. Only these figures are sent to the model.
    const outcome = computeSimulation({
      rent: run.rent_choice as RentChoiceId,
      tpass,
      savingsRate: run.savings_rate,
    });

    const { message, stub } = await generateCoachMessage(outcome);
    await addCoachMessage(run.id, message);

    return NextResponse.json({ message, stub });
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json(
        { error: "coach_not_configured" },
        { status: 503 },
      );
    }
    console.error("coach failed", e);
    return NextResponse.json({ error: "coach_failed" }, { status: 502 });
  }
}
