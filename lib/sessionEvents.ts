/**
 * Tells client components that the session changed (a sign-in, a new
 * account, a sign-out) so the navbar can re-read GET /api/session without
 * a page refresh. A plain window event: no state library, no second
 * session. A Google sign-in is a full-page redirect, so the navbar reads
 * the session on load anyway.
 */
const EVENT = "fs:session-changed";

export function emitSessionChange(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

/** Subscribes; returns the unsubscribe function (for a useEffect cleanup). */
export function onSessionChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}
