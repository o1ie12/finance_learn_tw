import { NextResponse } from "next/server";
import { isNotConfigured, updateStudentProfile } from "@/lib/db";
import { getCurrentStudent } from "@/lib/session";
import { readProfile } from "@/lib/studentProfile";
import { allLineContent } from "@/lib/tasks/registry";

export const runtime = "nodejs";

/** Every takeaway name in the content: only these can be saved to 工具箱. */
function knownTools(): Set<string> {
  const names = new Set<string>();
  for (const line of allLineContent()) {
    names.add(line.takeaway.name);
    for (const l of line.lessons) names.add(l.takeaway.name);
  }
  return names;
}

/** Save a takeaway to 工具箱 (01 §6.5 panel 4). Body: { name }. */
export async function POST(req: Request) {
  let body: { name?: unknown } | null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const name = typeof body?.name === "string" ? body.name : "";
  if (!knownTools().has(name)) return NextResponse.json({ error: "unknown_tool" }, { status: 400 });
  try {
    const student = await getCurrentStudent();
    if (!student) return NextResponse.json({ error: "no_session" }, { status: 401 });
    const saved = readProfile(student.profile).savedTools ?? [];
    if (!saved.includes(name)) await updateStudentProfile(student.id, { savedTools: [...saved, name] });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (isNotConfigured(e)) return NextResponse.json({ error: "backend_not_configured" }, { status: 503 });
    console.error("tools save failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
