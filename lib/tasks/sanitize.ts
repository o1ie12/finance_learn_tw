/**
 * Rebuild a submitted answer set from the content's own step ids and each
 * step type's expected shape (03 §2), before anything is scored or stored.
 * Unknown steps, unknown keys, oversized arrays and long strings are
 * dropped, so a client cannot store arbitrary data in a result row.
 */

import type { TaskSet, TaskStep } from "./types";

const MAX_ID = 40;
const MAX_ITEMS = 60;

function id(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 && v.length <= MAX_ID ? v : null;
}

function ids(v: unknown): string[] {
  return Array.isArray(v) ? v.slice(0, MAX_ITEMS).map(id).filter((x): x is string => x !== null) : [];
}

function record<T>(v: unknown, val: (x: unknown) => T | null): Record<string, T> {
  const out: Record<string, T> = {};
  if (!v || typeof v !== "object" || Array.isArray(v)) return out;
  for (const [k, x] of Object.entries(v as Record<string, unknown>).slice(0, MAX_ITEMS)) {
    const key = id(k);
    const value = val(x);
    if (key !== null && value !== null) out[key] = value;
  }
  return out;
}

function stepAnswer(step: TaskStep, raw: unknown): unknown {
  const a = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  switch (step.type) {
    case "choice": {
      const option = id(a.option);
      const reason = id(a.reason);
      return option === null ? null : reason === null ? { option } : { option, reason };
    }
    case "rate":
      return { ratings: record(a.ratings, (x) => (x === 1 || x === 2 || x === 3 ? x : null)) };
    case "find":
      return { selected: ids(a.selected) };
    case "number": {
      const v = a.value;
      if (typeof v === "number" && Number.isFinite(v)) return { value: v };
      if (typeof v === "string" && v.length <= 20) return { value: v };
      return null;
    }
    case "sort":
      return { placements: record(a.placements, id) };
    case "order":
      return { order: ids(a.order) };
    case "write": {
      // Plain text only: no control or invisible format characters, cut to the limit.
      if (typeof a.text !== "string") return null;
      const text = a.text.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/g, " ").trim();
      return text ? { text: [...text].slice(0, step.maxChars ?? 80).join("") } : null;
    }
  }
}

export function sanitizeAnswers(task: TaskSet, raw: unknown): Record<string, unknown> {
  const src = (raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const step of task.steps) {
    if (!Object.prototype.hasOwnProperty.call(src, step.id)) continue;
    const a = stepAnswer(step, src[step.id]);
    if (a !== null) out[step.id] = a;
  }
  return out;
}

/** A hook answer, only if it is one of the hook's own option ids. */
export function sanitizeHook(options: { id: string }[], raw: unknown): string | null {
  return typeof raw === "string" && options.some((o) => o.id === raw) ? raw : null;
}
