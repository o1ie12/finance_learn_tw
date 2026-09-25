import { NextResponse } from "next/server";
import { updateStudentProfile, isNotConfigured } from "@/lib/db";
import { getCurrentStudent } from "@/lib/session";
import { CURRENT_TUTORIAL_VERSION } from "@/lib/tour";

export const runtime = "nodejs";

/**
 * Record that the student has seen the tour.
 *
 * The version comes from the server's own constant rather than the request
 * body: a client that sent an inflated number would permanently opt itself
 * out of every future tour, and there is no reason for the browser to have a
 * say in which version it just watched.
 *
 * Finishing and skipping are the same outcome here on purpose — both mean
 * "do not show this to me again", and a student who skips has made that
 * choice just as deliberately as one who clicks through to the end.
 */
export async function POST() {
  try {
    const student = await getCurrentStudent();
    if (!student) {
      return NextResponse.json({ error: "no_session" }, { status: 401 });
    }
    await updateStudentProfile(student.id, {
      tutorialSeenVersion: CURRENT_TUTORIAL_VERSION,
    });
    return NextResponse.json({ tutorialSeenVersion: CURRENT_TUTORIAL_VERSION });
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json(
        { error: "backend_not_configured" },
        { status: 503 },
      );
    }
    console.error("tour post failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
