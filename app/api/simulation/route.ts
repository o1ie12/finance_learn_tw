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
import { parseSimResult, creditRecordOf, type SimResult } from "@/lib/sims/types";
import {
  readProfile,
  startingIncome,
  investableAmount,
  financialSnapshot,
} from "@/lib/studentProfile";
import type { Student } from "@/lib/types";
import { SIMULATION_POINTS } from "@/lib/points";
import { outcomeTitleFor } from "@/lib/outcomeTitle";

export const runtime = "nodejs";

/**
 * Fold a validated result into the student's cross-line profile.
 *
 * Switching on `kind` rather than on the line slug is deliberate: the slug
 * survives a simulation being replaced, the kind does not, so keying off the
 * kind means a future replacement cannot silently keep feeding the profile a
 * shape that no longer means what it did. TypeScript narrows `outcome` per
 * branch, so reading another simulation's field here fails to compile.
 */
async function writeProfileContribution(
  studentId: string,
  result: SimResult,
): Promise<void> {
  switch (result.kind) {
    case "zhiya_career_choice_v1": {
      const { interest, pathId, startingIncome } = result.outcome;
      await updateStudentProfile(studentId, {
        interest,
        careerPathId: pathId,
        monthlyIncome: startingIncome,
      });
      return;
    }
    case "xiaofei_needs_wants_v1": {
      // Direction is whether the month absorbed the surprise. The amount is
      // the shortfall when it did not, and what they deliberately set aside
      // when it did — "how much did you keep" is the behaviour worth
      // recording, not the accidental leftover.
      const { absorbedShortfall, shortfallGap, savings } = result.outcome;
      await updateStudentProfile(studentId, {
        savingsBehavior: absorbedShortfall
          ? { direction: "surplus", amount: Math.max(0, Math.round(savings)) }
          : {
              direction: "shortfall",
              amount: Math.max(0, Math.round(shortfallGap)),
            },
      });
      return;
    }
    case "cunqian_savings_v1": {
      await updateStudentProfile(studentId, {
        savingsAmount: Math.max(0, Math.round(result.outcome.user.finalAmount)),
      });
      return;
    }
    case "xinyong_credit_card_v1": {
      await updateStudentProfile(studentId, {
        creditRecord: creditRecordOf(result.outcome),
      });
      return;
    }
    case "touzi_twse_reflection_v1": {
      // Same profile fields as the custom simulator writes, so the capstone
      // and anything else downstream cannot tell which mode produced them —
      // which is the property that makes flipping the flag safe.
      await updateStudentProfile(studentId, {
        hasInvested: result.outcome.hasInvested,
        investedAmount: Math.max(0, Math.round(result.outcome.investedAmount)),
      });
      return;
    }
    case "touzi_investing_v1": {
      // 定存 and 全部花掉 are decisions about the money, but neither is
      // investing — recording them as such would have the capstone raise an
      // opportunity-cost question about money that was never at risk.
      const invested =
        result.outcome.chosen.id === "buy0050" ||
        result.outcome.chosen.id === "buy0056";
      await updateStudentProfile(studentId, {
        hasInvested: invested,
        investedAmount: invested ? Math.max(0, Math.round(result.outcome.start)) : 0,
      });
      return;
    }
    default:
      return;
  }
}

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
  const profile = readProfile(student.profile);
  if (lineSlug === "qixin") {
    const money = startingIncome(profile);
    b.income = money.amount;
    b.incomeFromCareer = money.fromEarnLine;
  }
  // 信用線 words its three purchases around what the student said they were
  // drawn to in 職涯線. Wording only — amounts and interest are identical.
  if (lineSlug === "xinyong") {
    b.interest = profile.interest ?? null;
  }
  // 投資線 works with what 存錢線 actually produced rather than a fixed
  // hypothetical. Server-resolved for the same reason as qixin's income: a
  // client-supplied starting sum would let anyone invest any amount.
  if (lineSlug === "touzi") {
    const investable = investableAmount(profile);
    b.start = investable.amount;
    // Only read by the linkout mode; harmless and ignored by the custom
    // simulator, so the injection does not need to know which mode is live.
    b.fromSavingsLine = investable.fromSavingsLine;
    b.inShortfall = investable.inShortfall;
    b.interest = profile.interest ?? null;
  }
  // The capstone runs on the student's whole position. Resolved here, with a
  // documented stand-in for every field they have not earned yet, so a
  // student who skipped every prior line still gets a real, honest answer
  // rather than a blocked page.
  if (lineSlug === "caiwujuece") {
    const snap = financialSnapshot(profile);
    b.income = snap.income.amount;
    b.savings = snap.savings.amount;
    b.creditRecord = snap.credit.record;
    b.investedAmount = snap.invested.amount;
    b.hasInvested = snap.invested.hasInvested;
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

    // Each line contributes what later lines need to the student profile,
    // rather than later lines reading back one another's simulation_runs
    // rows. That is the whole point of the store: 消費 never has to know
    // 職涯線 exists, and the capstone never has to know any of them do.
    //
    // Writes happen here, after contract validation, so a shape that failed
    // validation can never reach the profile. The switch is exhaustive over
    // the kinds that contribute; every other kind writes nothing.
    await writeProfileContribution(student.id, validated.result);

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
