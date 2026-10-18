/**
 * The "play one month after a station" hand-off (01 §6.5 panel 5). Station
 * pages link to /play?return=<path>&next=<label>&toLine=…&toColor=…&toStation=…&toBlurb=…&toEn=…&toCode=….
 * Parsed on the server; everything from the query is untrusted text.
 */

export interface RideTarget {
  /** Same-origin path to go to after the ride. */
  returnTo: string;
  /** Short label of what comes next, e.g. the next station's name. */
  nextLabel: string | null;
  to: { lineName: string; lineColor: string; stationName: string; blurb: string };
  /** The destination's sign (05 A8.2): English line name and station code. */
  sign: { lineEnName: string; stationCode: string };
}

type Params = Record<string, string | string[] | undefined>;

function one(p: Params, key: string, max: number): string | null {
  const v = p[key];
  const s = Array.isArray(v) ? v[0] : v;
  if (typeof s !== "string") return null;
  const t = s.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  return t ? t.slice(0, max) : null;
}

/**
 * A path on this site only: starts with "/", never "//" or "/\" (which
 * browsers treat as another host), no control characters, no scheme.
 */
export function safeReturnPath(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/")) return null;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return null;
  if (raw.includes("\\")) return null;
  if (/[\u0000-\u001f\u007f\s]/.test(raw)) return null;
  return raw.slice(0, 300);
}

/** A line color from the query: a 6-digit hex only; anything else falls back to a neutral token. */
function safeColor(raw: string | null): string {
  return raw && /^#[0-9a-fA-F]{6}$/.test(raw) ? raw : "var(--ink-muted)";
}

export function parseRide(params: Params): RideTarget | null {
  const returnTo = safeReturnPath(one(params, "return", 300));
  if (!returnTo) return null;
  const nextLabel = one(params, "next", 40);
  return {
    returnTo,
    nextLabel,
    to: {
      lineName: one(params, "toLine", 20) ?? "下一條線",
      lineColor: safeColor(one(params, "toColor", 7)),
      stationName: one(params, "toStation", 20) ?? nextLabel ?? "下一站",
      blurb: one(params, "toBlurb", 80) ?? "",
    },
    sign: {
      lineEnName: (one(params, "toEn", 40) ?? "FINLINE").replace(/[^A-Za-z0-9 &.·-]/g, ""),
      stationCode: (one(params, "toCode", 24) ?? "").replace(/[^A-Za-z0-9 ·-]/g, ""),
    },
  };
}
