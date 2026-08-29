import { NextResponse } from "next/server";
import { supabaseAuthRoute, isGoogleAuthConfigured } from "@/lib/supabaseAuth";

export const runtime = "nodejs";

// Only two legitimate intents: a normal sign-in, or linking Google onto the
// account the caller is already signed into (started from dashboard
// settings). Anything else falls back to signin.
function parseIntent(url: URL): "signin" | "link" {
  return url.searchParams.get("intent") === "link" ? "link" : "signin";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const intent = parseIntent(url);

  if (!isGoogleAuthConfigured()) {
    return NextResponse.redirect(`${origin}/signup?error=google_not_configured`);
  }

  const supabase = await supabaseAuthRoute();
  const allowedDomain = process.env.ALLOWED_GOOGLE_DOMAIN?.trim();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/api/auth/google/callback?intent=${intent}`,
      // A UI hint only (pre-filters Google's account chooser) — the real
      // enforcement happens server-side in the callback, since a client
      // could otherwise skip straight past this parameter.
      queryParams: allowedDomain ? { hd: allowedDomain } : undefined,
    },
  });

  if (error || !data?.url) {
    return NextResponse.redirect(`${origin}/signup?error=google_failed`);
  }
  return NextResponse.redirect(data.url);
}
