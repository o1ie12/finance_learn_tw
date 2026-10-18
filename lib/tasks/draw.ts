/**
 * Seeded draw for RateStep.drawCount (e.g. 6 of 你是銀行's 18 files).
 *
 * Keyed by (taskSetId, studentId, attempt, stepId): the server scoring a
 * submission and the client rendering the step get the same items without
 * the client ever telling the server which ones it showed. A new attempt
 * draws a new set. Pure; never uses Math.random.
 */

import { mulberry32 } from "@/lib/lifeGame/rng";
import type { RateStep } from "./types";

export interface DrawKey {
  taskSetId: string;
  studentId: string;
  attempt: number;
}

/** FNV-1a over UTF-16 code units, to uint32. */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // Final avalanche (murmur3 fmix32) so near-identical keys spread out.
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

/** The seed string for a key. `salt` separates two drawn steps in one task. */
export function drawSeed(key: DrawKey, salt = ""): number {
  return hashString(`${key.taskSetId}|${key.studentId}|${key.attempt}|${salt}`);
}

/**
 * `count` distinct indices out of [0, n), chosen by a seeded partial
 * Fisher-Yates shuffle, returned in ascending order (content order).
 * count ≥ n (or invalid) returns every index.
 */
export function drawIndices(n: number, count: number | undefined, seed: number): number[] {
  const all = Array.from({ length: Math.max(0, Math.floor(n)) }, (_, i) => i);
  if (count === undefined || !Number.isFinite(count) || count >= all.length) return all;
  const k = Math.max(0, Math.floor(count));
  const next = mulberry32(seed);
  for (let i = 0; i < k; i++) {
    const j = i + Math.floor(next() * (all.length - i));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.slice(0, k).sort((a, b) => a - b);
}

/**
 * The items of a RateStep this student sees on this attempt, in content
 * order. All items when the step has no drawCount.
 */
export function drawRateItems(step: RateStep, key: DrawKey): RateStep["items"] {
  if (step.drawCount === undefined) return step.items;
  const idx = drawIndices(step.items.length, step.drawCount, drawSeed(key, step.id));
  return idx.map((i) => step.items[i]);
}
