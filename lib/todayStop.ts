/**
 * Today's stop (02 §7.2):
 *   1. A line in progress → its next required station (mode-aware order).
 *   2. Else the first line in the recommended order that is not complete
 *      (no line has prerequisites in the code today, so none are checked).
 *   3. Else one life-game month.
 * Lines in progress are taken in the recommended order too.
 */

import { LINES, type LineMeta, type LineSlug } from "@/lib/lines";
import type { LineStatus } from "@/lib/progressModel";
import { RECOMMENDED_ORDER } from "@/lib/lifeGame/unlocks";

export const DEFAULT_STOP_MINUTES = 15;

export type TodayStop =
  | { kind: "station" | "sim"; line: LineMeta; href: string; moduleNumber: number | null; label: string }
  | { kind: "turn"; href: "/play"; label: string };

/**
 * 10 DATA-3: the order a new student meets the lines: 職涯, 存錢, 消費, 信用,
 * 投資, then the applied lines in the map's order. Lines are never locked;
 * this only decides what 今天 offers.
 */
export const NEXT_ORDER: LineSlug[] = (() => {
  const core: LineSlug[] = ["zhiya", "cunqian", "qixin", "xinyong", "touzi"];
  return [...core, ...LINES.map((l) => l.slug).filter((s) => !core.includes(s))];
})();

/**
 * 今天's next stop (10 DATA-3), in order:
 * 1. the started, unfinished line the student touched last (`lastTouched`:
 *    slug → time of the latest finished station or run);
 * 2. else the first unfinished line in NEXT_ORDER, which never skips an
 *    untouched earlier core line;
 * 3. else a month of the life game.
 */
export function todayStop(
  statuses: LineStatus[],
  lastTouched: Partial<Record<LineSlug, number>> = {},
  /** Lines with a task attempt on record: a 做到一半 station counts as started. */
  touched: ReadonlySet<LineSlug> = new Set(),
): TodayStop {
  const bySlug = new Map(statuses.map((s) => [s.line.slug, s]));
  const ordered = NEXT_ORDER.map((slug) => bySlug.get(slug)).filter((s): s is LineStatus => !!s);

  const open = ordered.filter((s) => (s.started || touched.has(s.line.slug)) && !s.complete && s.next);
  if (open.length) {
    const last = open.reduce((a, b) => ((lastTouched[b.line.slug] ?? 0) > (lastTouched[a.line.slug] ?? 0) ? b : a));
    return fromNext(last);
  }

  const fresh = ordered.find((s) => !s.complete && s.next);
  if (fresh?.next) return fromNext(fresh);

  return { kind: "turn", href: "/play", label: "今天玩一個月" };
}

function fromNext(s: LineStatus): TodayStop {
  const n = s.next!;
  return {
    kind: n.kind,
    line: s.line,
    href: n.href,
    moduleNumber: n.moduleNumber ?? null,
    label: n.label,
  };
}

export function isLineSlugInOrder(slug: string): slug is LineSlug {
  return (RECOMMENDED_ORDER as string[]).includes(slug);
}
