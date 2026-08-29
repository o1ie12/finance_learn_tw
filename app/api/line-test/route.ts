import { NextResponse } from "next/server";
import { createLineTest, getLineTests, isNotConfigured } from "@/lib/db";
import { getCurrentStudent } from "@/lib/session";
import { isLineSlug } from "@/lib/lines";
import { getPrePostQuestions } from "@/lib/prePostQuestions";

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
  const phase = b.phase;
  const score = Number(b.score);

  if (!isLineSlug(lineSlug)) {
    return NextResponse.json({ error: "invalid_line" }, { status: 400 });
  }
  if (phase !== "pre" && phase !== "post") {
    return NextResponse.json({ error: "invalid_phase" }, { status: 400 });
  }
  const total = getPrePostQuestions(lineSlug).length;
  if (!Number.isFinite(score) || score < 0 || score > total) {
    return NextResponse.json({ error: "invalid_score" }, { status: 400 });
  }

  try {
    const student = await getCurrentStudent();
    if (!student) {
      return NextResponse.json({ error: "no_session" }, { status: 401 });
    }

    const row = await createLineTest({
      student_id: student.id,
      line_slug: lineSlug,
      phase,
      score,
      total,
    });
    const { pre, post } = await getLineTests(student.id, lineSlug);
    const delta = pre && post ? post.score - pre.score : null;

    return NextResponse.json({ test_id: row.id, pre, post, delta });
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json(
        { error: "backend_not_configured" },
        { status: 503 },
      );
    }
    console.error("line-test post failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
