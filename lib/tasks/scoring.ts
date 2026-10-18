/**
 * Scoring for every task step type (03 §2). Pure, deterministic, and run on
 * the server: the client's answer is untrusted input, so every function here
 * validates it and never throws. A malformed or unknown answer scores 0.
 *
 * Answer shapes (what the UI submits per step, keyed by step id):
 *
 *   choice  { option: string; reason?: string }
 *   rate    { ratings: Record<itemId, 1 | 2 | 3> }
 *           Only the items drawn for this (taskSetId, studentId, attempt)
 *           count (lib/tasks/draw.ts); ratings for other items are ignored.
 *   find    { selected: string[] }            field ids the student toggled on
 *   number  { value: number }                 a numeric string ("2,500") is accepted
 *   sort    { placements: Record<itemId, boxId> }
 *   order   { order: string[] }               every item id, once, in order
 *
 * Reflection steps (scored: false) accept any answer and always give
 * { scored: false, credit: 1 }.
 */

import { resolveNumber, type Goal } from "./compute";
import { drawRateItems } from "./draw";
import type {
  Accept,
  ChoiceStep,
  FindStep,
  NumberStep,
  OrderStep,
  RateStep,
  SortStep,
  StepResult,
  TaskSet,
  TaskStep,
} from "./types";

// --- answer shapes ---------------------------------------------------------------

export interface ChoiceAnswer {
  option: string;
  reason?: string;
}
export interface RateAnswer {
  ratings: Record<string, 1 | 2 | 3>;
}
export interface FindAnswer {
  selected: string[];
}
export interface NumberAnswer {
  value: number;
}
export interface SortAnswer {
  placements: Record<string, string>;
}
export interface OrderAnswer {
  order: string[];
}

export type StepAnswer =
  | ChoiceAnswer
  | RateAnswer
  | FindAnswer
  | NumberAnswer
  | SortAnswer
  | OrderAnswer;

/** Step answers for one task, keyed by step id. */
export type TaskAnswers = Record<string, unknown>;

// --- context and results ------------------------------------------------------------

export interface ScoreContext {
  /** The student's onboarding goal, for `goalMonthly` answers. */
  goal?: Goal | null;
  /** Needed to know which items a drawn RateStep showed. */
  studentId?: string;
  attempt?: number;
  /** Set by scoreTask from task.id; pass it when calling scoreStep directly. */
  taskSetId?: string;
}

export interface ItemCredit {
  id: string;
  credit: number;
}

export interface StepScore {
  /** 0..1. Always 1 for an unscored step. */
  credit: number;
  scored: boolean;
  /** Per item (rate, find targets, sort, choice parts) for the model answer. */
  perItem?: ItemCredit[];
  /**
   * True when a scored step could not be scored for this student (a
   * goalMonthly answer with no goal set). It then counts as unscored.
   */
  unresolved?: boolean;
}

export interface TaskScore {
  /** Sum of credits over scored steps. */
  score: number;
  /** Number of scored steps. */
  total: number;
  steps: StepResult[];
  /** Same order as `steps`: per-step detail for the model-answer screen. */
  details: StepScore[];
  passed: boolean;
}

export const DEFAULT_PASS_SCORE = 0.6;
const EPS = 1e-9;

// --- helpers --------------------------------------------------------------------------

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function stringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function own(rec: Record<string, unknown>, key: string): unknown {
  return Object.prototype.hasOwnProperty.call(rec, key) ? rec[key] : undefined;
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function mean(xs: number[]): number {
  return xs.length === 0 ? 0 : xs.reduce((s, x) => s + x, 0) / xs.length;
}

/** Credit for `picked` against a correct id plus `accept` alternatives. */
function acceptCredit(picked: string, correct: string | undefined, accept: Accept[] | undefined): number {
  if (correct !== undefined && picked === correct) return 1;
  let best = 0;
  for (const a of accept ?? []) {
    if (typeof a === "string") {
      if (a === picked) return 1;
    } else if (a && a.option === picked) {
      best = Math.max(best, clamp01(a.credit));
    }
  }
  return best;
}

export function isScored(step: TaskStep): boolean {
  return step.scored !== false;
}

/** True when a ChoiceStep's reason part is scored (2+ reasons and a correctReason). */
export function hasReasonPart(step: ChoiceStep): boolean {
  return (step.reasons?.length ?? 0) >= 2 && typeof step.correctReason === "string";
}

/** Parse a number answer: a finite number, or a string like "2,500" / "NT$2,500". */
export function parseNumberAnswer(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v !== "string") return null;
  const cleaned = v.replace(/NT\$|[,\s，]/g, "");
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Number of discordant pairs between `order` and `answer` (both permutations of the same ids). */
export function kendallDistance(order: string[], answer: string[]): number {
  const pos = new Map(answer.map((id, i) => [id, i]));
  const ranks = order.map((id) => pos.get(id) ?? -1);
  let d = 0;
  for (let i = 0; i < ranks.length; i++) {
    for (let j = i + 1; j < ranks.length; j++) {
      if (ranks[i] > ranks[j]) d++;
    }
  }
  return d;
}

// --- per type -----------------------------------------------------------------------

function scoreChoice(step: ChoiceStep, answer: unknown): StepScore {
  const a = isRecord(answer) ? answer : {};
  const option = own(a, "option");
  const reason = own(a, "reason");
  const valid = typeof option === "string" && step.options.some((o) => o.id === option);
  const choice = valid ? acceptCredit(option, step.correct, step.accept) : 0;
  if (!hasReasonPart(step)) {
    return { credit: choice, scored: true, perItem: [{ id: "choice", credit: choice }] };
  }
  const reasonCredit =
    typeof reason === "string" && reason === step.correctReason && step.reasons!.some((r) => r.id === reason)
      ? 1
      : 0;
  return {
    credit: 0.5 * choice + 0.5 * reasonCredit,
    scored: true,
    perItem: [
      { id: "choice", credit: choice },
      { id: "reason", credit: reasonCredit },
    ],
  };
}

function scoreRate(step: RateStep, answer: unknown, ctx: ScoreContext): StepScore {
  const a = isRecord(answer) ? answer : {};
  const ratings = isRecord(own(a, "ratings")) ? (own(a, "ratings") as Record<string, unknown>) : {};
  // Without a draw key the whole list counts; callers pass studentId and
  // attempt whenever the step has a drawCount.
  const canDraw =
    step.drawCount !== undefined &&
    typeof ctx.studentId === "string" &&
    typeof ctx.attempt === "number" &&
    typeof ctx.taskSetId === "string";
  const items = canDraw
    ? drawRateItems(step, { taskSetId: ctx.taskSetId!, studentId: ctx.studentId!, attempt: ctx.attempt! })
    : step.items;
  const perItem = items.map((item) => {
    const r = own(ratings, item.id);
    if (r !== 1 && r !== 2 && r !== 3) return { id: item.id, credit: 0 };
    if (r === item.answer || item.alsoFull?.includes(r)) return { id: item.id, credit: 1 };
    if (Math.abs(r - item.answer) === 1) return { id: item.id, credit: 0.5 };
    return { id: item.id, credit: 0 };
  });
  return { credit: mean(perItem.map((p) => p.credit)), scored: true, perItem };
}

function scoreFind(step: FindStep, answer: unknown): StepScore {
  const a = isRecord(answer) ? answer : {};
  const selected = new Set(stringArray(own(a, "selected")));
  const targets = new Set(step.targets);
  if (targets.size === 0) return { credit: 0, scored: true, perItem: [] };
  let hits = 0;
  let falseClicks = 0;
  for (const id of selected) {
    if (targets.has(id)) hits++;
    else falseClicks++;
  }
  const perItem = [...targets].map((id) => ({ id, credit: selected.has(id) ? 1 : 0 }));
  return { credit: clamp01((hits - falseClicks) / targets.size), scored: true, perItem };
}

function scoreNumber(step: NumberStep, answer: unknown, ctx: ScoreContext): StepScore {
  const expected = resolveNumber(step.answer, ctx);
  if (expected === null) return { credit: 1, scored: false, unresolved: true };
  const a = isRecord(answer) ? answer : {};
  const value = parseNumberAnswer(own(a, "value"));
  if (value === null) return { credit: 0, scored: true };
  const tol = typeof step.tolerance === "number" && step.tolerance > 0 ? step.tolerance : 0;
  return { credit: Math.abs(value - expected) <= tol + EPS ? 1 : 0, scored: true };
}

function scoreSort(step: SortStep, answer: unknown): StepScore {
  const a = isRecord(answer) ? answer : {};
  const placements = isRecord(own(a, "placements")) ? (own(a, "placements") as Record<string, unknown>) : {};
  const boxIds = new Set(step.boxes.map((b) => b.id));
  // Items with neither a box nor accept have no right answer: not counted.
  const perItem = step.items
    .filter((item) => item.box !== undefined || (item.accept?.length ?? 0) > 0)
    .map((item) => {
      const placed = own(placements, item.id);
      if (typeof placed !== "string" || !boxIds.has(placed)) return { id: item.id, credit: 0 };
      return { id: item.id, credit: acceptCredit(placed, item.box, item.accept) };
    });
  return { credit: mean(perItem.map((p) => p.credit)), scored: true, perItem };
}

function scoreOrder(step: OrderStep, answer: unknown): StepScore {
  const a = isRecord(answer) ? answer : {};
  const raw = stringArray(own(a, "order"));
  const ids = new Set(step.answer);
  const seen = new Set<string>();
  const order = raw.filter((id) => ids.has(id) && !seen.has(id) && (seen.add(id), true));
  // Must be a full permutation of the answer; anything else is no answer.
  if (order.length !== step.answer.length || raw.length !== order.length) {
    return { credit: 0, scored: true };
  }
  const n = order.length;
  const maxPairs = (n * (n - 1)) / 2;
  if (maxPairs === 0) return { credit: 1, scored: true };
  return { credit: 1 - kendallDistance(order, step.answer) / maxPairs, scored: true };
}

// --- public -------------------------------------------------------------------------

export function scoreStep(step: TaskStep, answer: unknown, ctx: ScoreContext = {}): StepScore {
  if (!isScored(step)) return { credit: 1, scored: false };
  try {
    switch (step.type) {
      case "choice":
        return scoreChoice(step, answer);
      case "rate":
        return scoreRate(step, answer, ctx);
      case "find":
        return scoreFind(step, answer);
      case "number":
        return scoreNumber(step, answer, ctx);
      case "sort":
        return scoreSort(step, answer);
      case "order":
        return scoreOrder(step, answer);
      default:
        return { credit: 0, scored: true };
    }
  } catch {
    // Malformed content or answer: never throw from scoring.
    return { credit: 0, scored: true };
  }
}

export function scoreTask(task: TaskSet, answers: unknown, ctx: ScoreContext = {}): TaskScore {
  const byStep = isRecord(answers) ? answers : {};
  const stepCtx: ScoreContext = { ...ctx, taskSetId: task.id };
  const steps: StepResult[] = [];
  const details: StepScore[] = [];
  let score = 0;
  let total = 0;
  for (const step of task.steps) {
    const answer = own(byStep, step.id);
    const s = scoreStep(step, answer, stepCtx);
    const credit = s.scored ? clamp01(s.credit) : 1;
    details.push({ ...s, credit });
    steps.push({ stepId: step.id, answer: answer ?? null, correct: credit });
    if (s.scored) {
      score += credit;
      total++;
    }
  }
  const pass =
    typeof task.passScore === "number" && task.passScore >= 0 && task.passScore <= 1
      ? task.passScore
      : DEFAULT_PASS_SCORE;
  const passed = total === 0 || score / total + EPS >= pass;
  return { score, total, steps, details, passed };
}
