import { NextResponse } from "next/server";
import { createSimulationRun, isNotConfigured } from "@/lib/db";
import { getCurrentStudent } from "@/lib/session";
import { isLineSlug } from "@/lib/lines";
import { dispatchSimulation } from "@/lib/sims/dispatch";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const lineSlug = b.line_slug;
  if (!isLineSlug(lineSlug)) {
    return NextResponse.json({ error: "invalid_line" }, { status: 400 });
  }

  const dispatched = dispatchSimulation(lineSlug, b);
  if (!dispatched.ok) {
    return NextResponse.json({ error: dispatched.error }, { status: 400 });
  }

  try {
    const student = await getCurrentStudent();
    if (!student) {
      return NextResponse.json({ error: "no_session" }, { status: 401 });
    }

    const run = await createSimulationRun({
      student_id: student.id,
      ...dispatched.storeInput,
    });

    return NextResponse.json({
      run_id: run.id,
      line_slug: lineSlug,
      outcome: dispatched.outcome,
    });
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
