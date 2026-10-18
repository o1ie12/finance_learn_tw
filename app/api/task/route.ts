import { NextResponse } from "next/server";
import { isNotConfigured } from "@/lib/db";
import { getCurrentStudent } from "@/lib/session";
import { submitTask } from "@/lib/tasks/submit";

export const runtime = "nodejs";

/** Submit a station or library task. Body: { taskSetId, answers, hookAnswer }. */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (typeof body?.taskSetId !== "string") {
    return NextResponse.json({ error: "missing_task" }, { status: 400 });
  }
  try {
    const student = await getCurrentStudent();
    if (!student) return NextResponse.json({ error: "no_session" }, { status: 401 });
    const out = await submitTask(student, {
      taskSetId: body.taskSetId,
      answers: body.answers,
      hookAnswer: body.hookAnswer,
    });
    if ("error" in out) return NextResponse.json({ error: out.error }, { status: 400 });
    return NextResponse.json({
      score: out.score.score,
      total: out.score.total,
      passed: out.passed,
      details: out.score.details,
      stationDone: out.stationDone,
      reveal: out.reveal,
      attempt: out.attempt,
      answerKey: out.answerKey,
    });
  } catch (e) {
    if (isNotConfigured(e)) return NextResponse.json({ error: "backend_not_configured" }, { status: 503 });
    console.error("task submit failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
