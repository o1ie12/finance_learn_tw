/**
 * Today's stop (02 §7.2):
 *   1. A line in progress → its next required station (mode-aware order).
 *   2. Else the first line in the recommended order that is not complete
 *      (no line has prerequisites in the code today, so none are checked).
 *   3. Else one life-game month.
 * Lines in progress are taken in the recommended order too.
 */

import type { LineMeta, LineSlug } from "@/lib/lines";
import type { LineStatus } from "@/lib/progressModel";
import { RECOMMENDED_ORDER } from "@/lib/lifeGame/unlocks";

export const DEFAULT_STOP_MINUTES = 15;

export type TodayStop =
  | { kind: "station" | "sim"; line: LineMeta; href: string; moduleNumber: number | null; label: string }
  | { kind: "turn"; href: "/play"; label: string };

export function todayStop(statuses: LineStatus[]): TodayStop {
  const bySlug = new Map(statuses.map((s) => [s.line.slug, s]));
  const ordered = RECOMMENDED_ORDER.map((slug) => bySlug.get(slug)).filter((s): s is LineStatus => !!s);

  const inProgress = ordered.find((s) => s.started && !s.complete && s.next);
  if (inProgress?.next) return fromNext(inProgress);

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
