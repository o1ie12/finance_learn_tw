import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function isGoogleAuthConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
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
