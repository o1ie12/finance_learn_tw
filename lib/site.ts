/**
 * The contact address, derived from wherever the app is actually served.
 *
 * It used to be the literal string "hello@qidian.tw", which survived the
 * rename to 錢途 Finline on purpose — inventing finline.tw would have put a
 * domain nobody owns in front of students on the privacy and terms pages.
 * But leaving the OLD domain there has the same defect for the same reason:
 * it is an address that does not reach anyone, printed on the two pages most
 * likely to be read by someone with a complaint.
 *
 * So it is computed from NEXT_PUBLIC_SITE_URL — already the convention for
 * the sitemap, robots and metadataBase — falling back to the platform's own
 * deployment URL. Registering a real domain and pointing that variable at it
 * is then the only step; nothing here needs editing again.
 *
 * When no real domain is configured, this returns null rather than a
 * plausible-looking guess, and callers show a plain "not available yet"
 * instead of a mailto link that goes nowhere. An address that silently fails
 * is worse than an honest absence on a privacy page.
 */

/** The local mailbox part. Owned here so the domain is the only variable. */
const CONTACT_MAILBOX = "hello";

function servingHost(): string | null {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "");
  if (!raw) return null;
  let host: string;
  try {
    host = new URL(raw).hostname.toLowerCase();
  } catch {
    return null;
  }
  host = host.replace(/^www\./, "");
  // Hosts that cannot receive mail. A preview deployment's generated
  // subdomain is in this list deliberately: it resolves, which makes the
  // address look more real than the old one while being just as dead.
  const undeliverable =
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".vercel.app") ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
  return undeliverable ? null : host;
}

/**
 * The address to show, or null when the app is not yet served from a domain
 * that could receive mail. Callers must handle null.
 */
export const CONTACT_EMAIL: string | null = (() => {
  const host = servingHost();
  return host ? `${CONTACT_MAILBOX}@${host}` : null;
})();

/** Shown in place of the address while there is no deliverable domain. */
export const CONTACT_UNAVAILABLE_TEXT =
  "目前還沒有正式的聯絡信箱，網站正式上線後會公布在這裡。";
