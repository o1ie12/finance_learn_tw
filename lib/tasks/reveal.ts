/**
 * Picks the bias reveal text (03 §1 BiasReveal).
 *
 * Pick order: byOutcome (via outcomeFrom) → byHookOption → default.
 * outcomeFrom names a step; the option the student chose in it (a choice
 * answer's `option`) maps to an outcome id, and byOutcome holds that
 * outcome's text. Any gap in the chain falls through to the next source.
 */

import type { BiasReveal } from "./types";

export type RevealSource = "byOutcome" | "byHookOption" | "default";

function chosenOption(answer: unknown): string | null {
  if (typeof answer === "string") return answer;
  if (typeof answer === "object" && answer !== null && !Array.isArray(answer)) {
    const option = (answer as Record<string, unknown>).option;
    if (typeof option === "string") return option;
  }
  return null;
}

function lookup(rec: Record<string, string> | undefined, key: string | null): string | null {
  if (!rec || key === null || !Object.prototype.hasOwnProperty.call(rec, key)) return null;
  const v = rec[key];
  return typeof v === "string" && v.length > 0 ? v : null;
}

export function pickRevealWithSource(
  reveal: BiasReveal,
  hookAnswer: string | null | undefined,
  answers: Record<string, unknown> | null | undefined,
): { text: string; source: RevealSource } {
  if (reveal.outcomeFrom && reveal.byOutcome && answers && typeof answers === "object") {
    const { stepId, map } = reveal.outcomeFrom;
    const option = Object.prototype.hasOwnProperty.call(answers, stepId)
      ? chosenOption(answers[stepId])
      : null;
    const text = lookup(reveal.byOutcome, lookup(map, option));
    if (text) return { text, source: "byOutcome" };
  }
  const byHook = lookup(reveal.byHookOption, hookAnswer ?? null);
  if (byHook) return { text: byHook, source: "byHookOption" };
  return { text: reveal.default, source: "default" };
}

export function pickReveal(
  reveal: BiasReveal,
  hookAnswer: string | null | undefined,
  answers: Record<string, unknown> | null | undefined,
): string {
  return pickRevealWithSource(reveal, hookAnswer, answers).text;
}
