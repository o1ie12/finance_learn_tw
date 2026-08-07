import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Short-lived, tamper-proof carrier for a verified Google identity between
 * the OAuth callback (which confirms it with Supabase/Google) and the
 * "enter a code to link" / "start fresh" choice screen a cold sign-in with
 * no existing match lands on. Nothing is created or linked until the
 * student picks one of those two, so the identity has to survive that one
 * extra redirect — a cookie is the only place to put it that isn't the URL
 * (which must never carry an email/identity per privacy rules).
 *
 * Signed with HMAC-SHA256 rather than minting a new required secret: it
 * reuses SUPABASE_SERVICE_ROLE_KEY, which is already required whenever
 * Supabase is configured at all.
 */

export interface PendingGoogleIdentity {
  google_uid: string;
  google_email: string;
  issued_at: number;
}

const PENDING_TTL_MS = 10 * 60 * 1000;

function signingKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required to sign the pending Google identity cookie",
    );
  }
  return key;
}

export function signPendingGoogleIdentity(identity: {
  google_uid: string;
  google_email: string;
}): string {
  const payload: PendingGoogleIdentity = { ...identity, issued_at: Date.now() };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", signingKey()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyPendingGoogleIdentity(
  token: string | null | undefined,
): PendingGoogleIdentity | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = createHmac("sha256", signingKey()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  let payload: PendingGoogleIdentity;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (!payload.google_uid || !payload.google_email) return null;
  if (Date.now() - payload.issued_at > PENDING_TTL_MS) return null;
  return payload;
}

/**
 * Authoritative, server-side domain check. Google's `hd` parameter (sent at
 * OAuth-start time as a UI hint on the account chooser) is not itself a
 * security boundary — a client can start the flow without it — so every
 * completed Google auth is re-checked here regardless of what was
 * requested. Unset/empty ALLOWED_GOOGLE_DOMAIN allows any domain, which is
 * the default until a partner school's domain is confirmed.
 */
export function isEmailDomainAllowed(email: string): boolean {
  const allowed = process.env.ALLOWED_GOOGLE_DOMAIN?.trim();
  if (!allowed) return true;
  const domain = email.split("@")[1]?.toLowerCase();
  return domain === allowed.toLowerCase();
}
