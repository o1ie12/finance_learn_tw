import { NextResponse } from "next/server";
import { supabaseAuthRoute } from "@/lib/supabaseAuth";
import { isEmailDomainAllowed, signPendingGoogleIdentity } from "@/lib/googleAccount";
import {
  getStudentByGoogleUid,
  linkGoogleToStudentId,
  isNotConfigured,
} from "@/lib/db";
import {
  UID_COOKIE,
  PENDING_GOOGLE_COOKIE,
  PENDING_GOOGLE_MAX_AGE,
  HAS_SESSION_COOKIE,
  accessCookieOptions,
  hasSessionCookieOptions,
  getCurrentStudent,
} from "@/lib/session";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const intent = url.searchParams.get("intent") === "link" ? "link" : "signin";

  if (!code) {
    return NextResponse.redirect(`${origin}/signup?error=google_failed`);
  }

  const supabase = await supabaseAuthRoute();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  const user = data?.user;

  if (error || !user?.email) {
    return NextResponse.redirect(`${origin}/signup?error=google_failed`);
  }

  // Authoritative check — the `hd` param sent at start-time was only a UI
  // hint, so re-verify server-side regardless of intent.
  if (!isEmailDomainAllowed(user.email)) {
    await supabase.auth.signOut().catch(() => {});
    return NextResponse.redirect(`${origin}/signup?error=google_domain`);
  }

  const googleUid = user.id;
  const googleEmail = user.email;
  // This transient Supabase session was only the OAuth handshake — our
  // real session of record is the fs_uid cookie set below.
  await supabase.auth.signOut().catch(() => {});

  try {
    if (intent === "link") {
      const current = await getCurrentStudent();
      if (!current) {
        return NextResponse.redirect(`${origin}/signup?error=not_signed_in`);
      }
      const result = await linkGoogleToStudentId(current.id, googleUid, googleEmail);
      if (!result.ok) {
        return NextResponse.redirect(`${origin}/dashboard?linked_error=already_used`);
      }
      return NextResponse.redirect(`${origin}/dashboard?linked=1`);
    }

    // intent === "signin"
    const existing = await getStudentByGoogleUid(googleUid);
    if (existing) {
      const res = NextResponse.redirect(`${origin}/dashboard`);
      res.cookies.set(UID_COOKIE, existing.id, accessCookieOptions());
      res.cookies.set(HAS_SESSION_COOKIE, "1", hasSessionCookieOptions());
      return res;
    }

    // No account linked to this Google identity yet — don't create or link
    // anything until the student explicitly chooses how, on /signup/google.
    const token = signPendingGoogleIdentity({ google_uid: googleUid, google_email: googleEmail });
    const res = NextResponse.redirect(`${origin}/signup/google`);
    res.cookies.set(PENDING_GOOGLE_COOKIE, token, {
      ...accessCookieOptions(),
      maxAge: PENDING_GOOGLE_MAX_AGE,
    });
    return res;
  } catch (e) {
    if (isNotConfigured(e)) {
      return NextResponse.redirect(`${origin}/signup?error=backend_not_configured`);
    }
    console.error("google callback failed", e);
    return NextResponse.redirect(`${origin}/signup?error=server_error`);
  }
}
