/**
 * Client-side drafts for each step type and how they become the answer
 * shapes lib/tasks/scoring.ts accepts. A draft is what the student is still
 * editing; 「送出」 checks it is complete and turns it into the answer.
 */

import { parseNumberAnswer } from "@/lib/tasks/scoring";
import type { TaskStep } from "@/lib/tasks/types";

export interface ChoiceDraft {
  option?: string;
  reason?: string;
}
export interface RateDraft {
  ratings: Record<string, 1 | 2 | 3>;
}
export interface FindDraft {
  selected: string[];
}
export interface NumberDraft {
  raw: string;
}
export interface SortDraft {
  placements: Record<string, string>;
}
export interface OrderDraft {
  order: string[];
}

export type Draft = ChoiceDraft | RateDraft | FindDraft | NumberDraft | SortDraft | OrderDraft;

/** The reason part is shown when the step lists 2 or more reasons. */
export function showsReasons(step: TaskStep): boolean {
  return step.type === "choice" && (step.reasons?.length ?? 0) >= 2;
}

export function emptyDraft(step: TaskStep): Draft {
  switch (step.type) {
    case "choice":
      return {};
    case "rate":
      return { ratings: {} };
    case "find":
      return { selected: [] };
    case "number":
      return { raw: "" };
    case "sort":
      return { placements: {} };
    case "order":
      return { order: step.items.map((i) => i.id) };
  }
}

/**
 * Null when the draft can be sent, else a short message saying what is
 * missing. `rateItemIds` are the items drawn for this attempt.
 */
export function draftProblem(step: TaskStep, draft: Draft, rateItemIds?: string[]): string | null {
  switch (step.type) {
    case "choice": {
      const d = draft as ChoiceDraft;
      if (!d.option) return "先選一個答案。";
      if (showsReasons(step) && !d.reason) return "再選一個理由。";
      return null;
    }
    case "rate": {
      const d = draft as RateDraft;
      const ids = rateItemIds ?? step.items.map((i) => i.id);
      const left = ids.filter((id) => !d.ratings[id]).length;
      return left > 0 ? `還有 ${left} 份沒有給分。` : null;
    }
    case "find": {
      const d = draft as FindDraft;
      return d.selected.length === 0 ? "先在文件上點選至少一個欄位。" : null;
    }
    case "number": {
      const d = draft as NumberDraft;
      if (d.raw.trim() === "") return "先填一個數字。";
      return parseNumberAnswer(d.raw.trim()) === null ? "請只填數字，例如 6,390。" : null;
    }
    case "sort": {
      const d = draft as SortDraft;
      const left = step.items.filter((i) => !d.placements[i.id]).length;
      return left > 0 ? `還有 ${left} 項沒有分類。` : null;
    }
    case "order":
      return null;
  }
}

/** The answer object sent to the server for this step. */
export function draftToAnswer(step: TaskStep, draft: Draft): unknown {
  switch (step.type) {
    case "choice": {
      const d = draft as ChoiceDraft;
      return showsReasons(step) && d.reason ? { option: d.option, reason: d.reason } : { option: d.option };
    }
    case "rate":
      return { ratings: { ...(draft as RateDraft).ratings } };
    case "find":
      return { selected: [...(draft as FindDraft).selected] };
    case "number":
      return { value: parseNumberAnswer((draft as NumberDraft).raw.trim()) };
    case "sort":
      return { placements: { ...(draft as SortDraft).placements } };
    case "order":
      return { order: [...(draft as OrderDraft).order] };
  }
}

/** "3.5" / "4": a score with at most one decimal. */
export function formatScore(n: number): string {
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}

/** A number in the step's unit: NT$6,390 / 1.7% / 12 個. */
export function formatUnitValue(value: number, unit?: string): string {
  const num = value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (unit === "NT$") return value < 0 ? `-NT$${Math.abs(value).toLocaleString("en-US", { maximumFractionDigits: 2 })}` : `NT$${num}`;
  if (unit === "%") return `${num}%`;
  return unit ? `${num} ${unit}` : num;
}

/**
 * The score screen's line (05 A6). A station is done on a pass or on the
 * second attempt (03 §4); the copy says exactly that state.
 */
export function scoreStatus(
  mode: "station" | "terminal" | "library",
  r: { total: number; passed: boolean; stationDone: boolean },
): string {
  if (r.total === 0) return "這一站沒有計分，你的想法已經存下來。";
  if (r.passed) return mode === "station" ? "過關了，這一站完成。" : "過關了。";
  if (mode === "terminal") return "完成了。看看每一題的示範答案。";
  if (mode === "library") return "還差一點，可以再試一次。";
  if (r.stationDone) return "這一站完成了。";
  return "還差一點。再試一次；第二次不論分數，這一站都會完成。";
}
