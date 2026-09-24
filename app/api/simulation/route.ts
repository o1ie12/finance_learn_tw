import { NextResponse } from "next/server";
import {
  createSimulationRun,
  getLatestSimulationRunForLine,
  addPoints,
  updateStudentProfile,
  isNotConfigured,
} from "@/lib/db";
import { getCurrentStudent } from "@/lib/session";
import { isLineSlug } from "@/lib/lines";
import { dispatchSimulation } from "@/lib/sims/dispatch";
import { parseSimResult } from "@/lib/sims/types";
import { readProfile, startingIncome } from "@/lib/studentProfile";
import type { Student } from "@/lib/types";
import { SIMULATION_POINTS } from "@/lib/points";
import { outcomeTitleFor } from "@/lib/outcomeTitle";

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

  // 消費線 spends the income 職涯線 produced. Resolve it here from the
  // student's own profile and overwrite whatever the request carried — a
  // client-supplied income would let anyone hand themselves any budget.
  let student: Student | null = null;
  try {
    student = await getCurrentStudent();
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json(
        { error: "backend_not_configured" },
        { status: 503 },
      );
    }
    throw e;
  }
  if (!student) {
    return NextResponse.json({ error: "no_session" }, { status: 401 });
  }
  if (lineSlug === "qixin") {
    const money = startingIncome(readProfile(student.profile));
    b.income = money.amount;
    b.incomeFromCareer = money.fromEarnLine;
  }

  const dispatched = dispatchSimulation(lineSlug, b);
  if (!dispatched.ok) {
    return NextResponse.json({ error: dispatched.error }, { status: 400 });
  }

  // Validate the computed result against the shared contract BEFORE it is
  // stored. A shape that does not match is a bug in the simulation that
  // produced it, and storing it would hand a row to the coach, the stamp and
  // the certificate that they cannot read correctly — which is how three
  // consumers ended up rendering NT$0 figures. Reject loudly instead.
  const validated = parseSimResult({
    kind: dispatched.storeInput.kind,
    outcome: dispatched.storeInput.outcome_summary,
  });
  if (!validated.ok) {
    console.error(
      `simulation result failed contract validation — line=${lineSlug} kind=${dispatched.storeInput.kind}: ${validated.error}`,
    );
    return NextResponse.json({ error: "invalid_result_shape" }, { status: 500 });
  }

  try {
    // Award simulation points once per line: check whether it was ever
    // completed *before* this run, so replaying never double-counts.
    const priorRun = await getLatestSimulationRunForLine(student.id, lineSlug);

    const run = await createSimulationRun({
      student_id: student.id,
      ...dispatched.storeInput,
    });

    let pointsTotal = student.points_total;
    if (!priorRun) {
      pointsTotal = await addPoints(student.id, SIMULATION_POINTS);
    }

    // 職涯線's result is the one other lines need: 消費 spends the income it
    // produces. It goes into the student profile rather than being read back
    // out of this simulation_runs row, so 消費 never has to know 職涯線
    // exists — see lib/studentProfile.ts.
    if (validated.result.kind === "zhiya_career_choice_v1") {
      const { interest, pathId, startingIncome } = validated.result.outcome;
      await updateStudentProfile(student.id, {
        interest,
        careerPathId: pathId,
        monthlyIncome: startingIncome,
      });
    }

    return NextResponse.json({
      run_id: run.id,
      line_slug: lineSlug,
      outcome: dispatched.outcome,
      outcome_title: outcomeTitleFor(run),
      points_total: pointsTotal,
      points_awarded: priorRun ? 0 : SIMULATION_POINTS,
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
