import { NextResponse } from "next/server";
import { isNotConfigured, updateStudentProfile } from "@/lib/db";
import { getCurrentStudent } from "@/lib/session";
import { readProfile } from "@/lib/studentProfile";

export const runtime = "nodejs";

/**
 * Count one full train ride watched to the end (01 §7.3: after 3, rides
 * become a short crossfade). The client sends nothing: the server reads the
 * stored count and adds one, so a request can only ever move it by one.
 */
export async function POST() {
  try {
    const student = await getCurrentStudent();
    if (!student) {
      return NextResponse.json({ error: "no_session" }, { status: 401 });
    }
    const seenFullRides = (readProfile(student.profile).seenFullRides ?? 0) + 1;
    await updateStudentProfile(student.id, { seenFullRides });
    return NextResponse.json({ seenFullRides });
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json({ error: "backend_not_configured" }, { status: 503 });
    }
    console.error("rides post failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
