import { NextResponse } from "next/server";
import { getStudentByCode, isNotConfigured } from "@/lib/db";
import { sendCodeEmail, isValidEmail } from "@/lib/emailCode";

export const runtime = "nodejs";

/**
 * 9c — resends an existing access code to an email the student types in
 * that moment. Stateless on purpose: the email is used once to address the
 * message and is never written to the database. The `code` must belong to
 * a real student (checked via getStudentByCode) so this can't be used as
 * an open mail relay to arbitrary addresses.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { code, email } = (body as Record<string, unknown>) ?? {};
  if (typeof code !== "string" || !code) {
    return NextResponse.json({ error: "missing_code" }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  try {
    const normalizedCode = code.toUpperCase();
    const student = await getStudentByCode(normalizedCode);
    if (!student) {
      return NextResponse.json({ error: "code_not_found" }, { status: 404 });
    }

    const { stub } = await sendCodeEmail(email, normalizedCode);
    return NextResponse.json({ sent: true, stub });
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.json(
        { error: "backend_not_configured" },
        { status: 503 },
      );
    }
    console.error("email-code failed", e);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }
}
