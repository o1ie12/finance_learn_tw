import { NextResponse } from "next/server";
import { z } from "zod";
import { AvatarSchema, readAvatar } from "@/lib/avatar";
import { isNotConfigured, setStudentAvatar, updateStudentProfile } from "@/lib/db";
import { ONBOARDING_VERSION, skipAvatar } from "@/lib/onboarding";
import { getCurrentStudent } from "@/lib/session";

export const runtime = "nodejs";

const BodySchema = z.union([
  z.object({ avatar: AvatarSchema }),
  z.object({ skip: z.literal(true) }),
]);

/**
 * Save the student's character (01 §6.2) and mark onboarding as seen.
 *
 * `{ avatar }` stores the parts after AvatarSchema validates every id and
 * the name. `{ skip: true }` is 「先跳過」: a student who already has a
 * character keeps it; one without gets the default parts named after them.
 * Either way the onboarding version is the server's constant, never the
 * client's (same reasoning as /api/tour).
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
      // Pass on the name rule's own words (validateName, Chinese); part-id
      // errors are a client bug and get the generic message on screen.
      const avatarRaw = (raw as { avatar?: unknown } | null)?.avatar;
      const nameIssue = AvatarSchema.safeParse(avatarRaw).error?.issues.find(
        (i) => i.path[0] === "name" && i.code === "custom",
      );
      return NextResponse.json(
        { error: "invalid_avatar", message: nameIssue?.message },
        { status: 400 },
      );
    }

    const existing = readAvatar(student.avatar);
    const avatar =
      "avatar" in parsed.data ? parsed.data.avatar : (existing ?? skipAvatar(student.name));
    if (avatar !== existing) {
      await setStudentAvatar(student.id, { ...avatar });
    }
    await updateStudentProfile(student.id, { onboardedVersion: ONBOARDING_VERSION });
    return NextResponse.json({ avatar, onboardedVersion: ONBOARDING_VERSION });
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json({ error: "backend_not_configured" }, { status: 503 });
    }
    console.error("avatar post failed", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
