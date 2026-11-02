/**
 * 10 CMP-1: how much of one text another already says. Chinese has no word
 * breaks, so "words" are character pairs (bigrams) over letters and CJK
 * only. Returns the share of the shorter text's pairs found in the longer
 * one, 0 to 1. Pairs that straddle words never match, so Chinese reads
 * lower than a person would: a note that only restates its cards scores
 * about 0.6. The compare screen hides a block over SCREEN_LINE against
 * everything it already shows; check-content reports pairs over 0.8 (the
 * file's rule) for a rewrite.
 */
export const SCREEN_LINE = 0.55;
import type { LessonCard } from "./types";

const pairs = (s: string): Set<string> => {
  const t = s.replace(/[^\p{L}\p{N}]/gu, "");
  const out = new Set<string>();
  for (let i = 0; i < t.length - 1; i++) out.add(t.slice(i, i + 2));
  return out;
};

export function overlap(a: string, b: string): number {
  const pa = pairs(a);
  const pb = pairs(b);
  const [small, big] = pa.size <= pb.size ? [pa, pb] : [pb, pa];
  if (small.size === 0) return 0;
  let hit = 0;
  for (const p of small) if (big.has(p)) hit++;
  return hit / small.size;
}

/** True when `text` mostly repeats what `seen` already says, taken together. */
export function repeats(text: string, seen: string[], line = SCREEN_LINE): boolean {
  return overlap(text, seen.join("。")) > line;
}

/** Every string a lesson card shows, joined, for the repeat check. */
export function cardText(c: LessonCard): string {
  const out: string[] = [];
  const walk = (v: unknown) => {
    if (typeof v === "string") out.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(c);
  return out.join("。");
}
