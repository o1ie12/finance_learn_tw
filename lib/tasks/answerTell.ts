/**
 * 10 CONT-1: does a choice give its right answer away by shape? The right
 * option (or reason) must be within 25% of the others' average length, and
 * must not be the only one with a number in it. Checked by check-content.
 *
 * Only sentence-like lists are measured for length: a list whose longest
 * label is under 10 characters (a scale like 0 / 10% / 20%, or 去 / 不去)
 * is not, and neither is a category picker of 5 or more shared labels (the
 * 詐騙 cases' 這是哪一種詐騙).
 */
import type { TaskStep } from "./types";

const len = (s: string) => [...s.replace(/\s/g, "")].length;
const digit = /[0-9０-９]/;

export interface Tell {
  stepId: string;
  list: "options" | "reasons";
  why: string;
}

function check(stepId: string, list: Tell["list"], items: { id: string; label: string }[], right: string | undefined): Tell[] {
  const r = items.find((i) => i.id === right);
  const others = items.filter((i) => i.id !== right);
  if (!r || others.length === 0) return [];
  const avg = others.reduce((a, o) => a + len(o.label), 0) / others.length;
  const out: Tell[] = [];
  const off = avg ? (len(r.label) - avg) / avg : 0;
  const sentences = Math.max(...items.map((i) => len(i.label))) >= 10 && items.length < 5;
  if (sentences && Math.abs(off) > 0.25) out.push({ stepId, list, why: `right is ${len(r.label)} characters, others ${avg.toFixed(1)} on average (${off > 0 ? "+" : ""}${Math.round(off * 100)}%)` });
  if (digit.test(r.label) && !others.some((o) => digit.test(o.label))) out.push({ stepId, list, why: "only the right one has a number" });
  return out;
}

export function answerTells(steps: TaskStep[]): Tell[] {
  return steps.flatMap((s) => {
    if (s.type !== "choice" || s.scored === false || s.ordered) return [];
    return [...check(s.id, "options", s.options, s.correct), ...(s.reasons ? check(s.id, "reasons", s.reasons, s.correctReason) : [])];
  });
}
