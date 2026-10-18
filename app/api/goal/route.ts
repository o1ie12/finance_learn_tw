import { NextResponse } from "next/server";
import { z } from "zod";
import { GOAL_REASONS } from "@/content/global";
import { isNotConfigured, updateStudentProfile } from "@/lib/db";
import {
  ONBOARDING_VERSION,
  smartCheck,
  starterMonthlyLeft,
  validateGoalName,
} from "@/lib/onboarding";
import { getCurrentStudent } from "@/lib/session";
import { readProfile } from "@/lib/studentProfile";

export const runtime = "nodejs";

const REASON_IDS = GOAL_REASONS.map((r) => r.id) as [string, ...string[]];

const BodySchema = z.union([
  z.object({ skip: z.literal(true) }),
  z.object({
    name: z.string().max(200),
    amount: z.number().int(),
    months: z.number().int(),
    reason: z.enum(REASON_IDS),
  }),
]);

/**
 * Store the student's one SMART goal (04 §1.3) on profile.goal, or record
 * 「先跳過」. The server runs the same smartCheck the form ran, against the
 * student's own starter budget, and refuses a goal that misses any tick:
 * a browser that skipped the check gets a 400 listing what is missing.
 */
export async function POST(request: Request) {
  try {
    const student = await getCurrentStudent();
    if (!student) {
      return NextResponse.json({ error: "no_session" }, { status: 401 });
    }

    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_goal" }, { status: 400 });
    }

    if ("skip" in parsed.data) {
      await updateStudentProfile(student.id, { onboardedVersion: ONBOARDING_VERSION });
      return NextResponse.json({ skipped: true, onboardedVersion: ONBOARDING_VERSION });
    }

    const { name, amount, months, reason } = parsed.data;
    const monthlyLeft = starterMonthlyLeft(readProfile(student.profile));
    const result = smartCheck({ name, amount, months, reason }, monthlyLeft);
    const nameCheck = validateGoalName(name);
    if (!result.allMet || !nameCheck.ok) {
      return NextResponse.json(
        { error: "not_smart", unmet: result.ticks.filter((t) => !t.met).map((t) => t.id) },
        { status: 400 },
      );
    }

    const goal = { name: nameCheck.value, amount, months, reason, setAt: new Date().toISOString() };
    await updateStudentProfile(student.id, { goal, onboardedVersion: ONBOARDING_VERSION });
    return NextResponse.json({ goal, monthly: result.monthly });
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json({ error: "backend_not_configured" }, { status: 503 });
    }
    console.error("goal post failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
