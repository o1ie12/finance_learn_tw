import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Google sign-in is on hold (2026-10-24): it needs NEXT_PUBLIC_GOOGLE_SIGNIN=1
 * as well as the Supabase keys, so setting a key alone never exposes it. Off:
 * no button on /signup, no link in 設定, and the start, callback and choice
 * routes send the visitor back to /signup.
 */
export function isGoogleAuthConfigured(): boolean {
  return process.env.NEXT_PUBLIC_GOOGLE_SIGNIN === "1" && Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
}

/**
 * A Supabase client bound to this request's cookies, used only to run the
 * Google OAuth handshake (starting the redirect, exchanging the code for a
 * session). This is not our app's session system — once the verified user
 * is read off it, our own account-linking logic takes over and we set our
 * own fs_uid cookie (see lib/session.ts). Only call from Route Handlers,
 * since starting/completing the handshake needs to write cookies.
 */
export async function supabaseAuthRoute() {
  const store = await cookies();
  return createServerClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            store.set(name, value, options),
          );
        },
      },
    },
  );
}
