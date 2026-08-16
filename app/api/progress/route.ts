import { NextResponse } from "next/server";
import {
  getProgress,
  upsertModuleProgress,
  addPoints,
  isNotConfigured,
} from "@/lib/db";
import { getCurrentStudent } from "@/lib/session";
import { MODULE_NUMBERS } from "@/lib/modules";
import { STATION_POINTS } from "@/lib/points";

export const runtime = "nodejs";

export async function GET() {
  try {
    const student = await getCurrentStudent();
    if (!student) {
      return NextResponse.json({ error: "no_session" }, { status: 401 });
    }
    const progress = await getProgress(student.id);
    return NextResponse.json({ progress });
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json(
        { error: "backend_not_configured" },
        { status: 503 },
      );
    }
    console.error("progress get failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const moduleNumber = Number(b?.module_number);
  const quizScore = Number(b?.quiz_score);
  const quizTotal = Number(b?.quiz_total);

  if (!MODULE_NUMBERS.includes(moduleNumber)) {
    return NextResponse.json({ error: "invalid_module" }, { status: 400 });
  }
  if (
    !Number.isInteger(quizScore) ||
    !Number.isInteger(quizTotal) ||
    quizTotal <= 0 ||
    quizScore < 0 ||
    quizScore > quizTotal
  ) {
    return NextResponse.json({ error: "invalid_score" }, { status: 400 });
  }

  try {
    const student = await getCurrentStudent();
    if (!student) {
      return NextResponse.json({ error: "no_session" }, { status: 401 });
    }

    // Award points once per station: check whether it was already completed
    // *before* this write, so retaking a quiz never double-counts.
    const priorProgress = await getProgress(student.id);
    const alreadyCompleted = priorProgress.some(
      (p) => p.module_number === moduleNumber && p.completed_at,
    );

    const row = await upsertModuleProgress(
      student.id,
      moduleNumber,
      quizScore,
      quizTotal,
    );

    let pointsTotal = student.points_total;
    if (!alreadyCompleted) {
      pointsTotal = await addPoints(student.id, STATION_POINTS);
    }

    return NextResponse.json({ progress: row, points_total: pointsTotal });
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json(
        { error: "backend_not_configured" },
        { status: 503 },
      );
    }
    console.error("progress post failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
