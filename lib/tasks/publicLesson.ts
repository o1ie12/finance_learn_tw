/**
 * What the browser may see of a lesson before the student submits (05 A2),
 * and the answer key it gets back after.
 *
 * Public lesson: prompts, options, boxes, items and documents only. Correct
 * ids, accept lists, reasons' correct id, model answers, explanations, item
 * answers and highlights, find targets, reveal maps and the after-tip are
 * removed. Options, reasons and sort/order items are shuffled per attempt
 * with a seeded shuffle (05 A7) unless a choice is an ordered scale; 你是銀行's
 * files are drawn on the server. The same seed gives the same order on every
 * render and on submit, so the order the student saw can be stored.
 *
 * Answer key: the full steps (computed answers resolved, 05 A5) plus the
 * after-tip, sent only in the submit response.
 *
 * Pure, so tests can assert no answer string survives in the public lesson.
 */

import { mulberry32 } from "@/lib/lifeGame/rng";
import { drawRateItems, hashString } from "./draw";
import { resolveTask } from "./resolve";
import type { StationLesson, TaskSet, TaskStep } from "./types";

export interface LessonKey {
  taskSetId: string;
  studentId: string;
  attempt: number;
}

/** The order each shuffled list was shown in, by step id (stored with the attempt). */
export type ShownOrder = Record<string, { options?: string[]; reasons?: string[]; items?: string[] }>;

function shuffled<T extends { id: string }>(list: T[], seed: number): T[] {
  const out = [...list];
  const next = mulberry32(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * A per-student base order, then rotated by the attempt number: each new
 * attempt moves every option one place, so across a student's attempts the
 * right answer visits every position evenly (05 A7), and across students the
 * base order differs.
 */
function attemptOrder<T extends { id: string }>(list: T[], key: LessonKey, stepId: string, what: string): T[] {
  const base = shuffled(list, hashString(`${key.taskSetId}|${key.studentId}|${stepId}|${what}`));
  const k = base.length ? (key.attempt - 1) % base.length : 0;
  return [...base.slice(k), ...base.slice(0, k)];
}

function seedFor(key: LessonKey, stepId: string, what: string): number {
  return hashString(`${key.taskSetId}|${key.studentId}|${key.attempt}|${stepId}|${what}`);
}

/** One step as the browser sees it, plus the order it was shown in. */
function publicStep(step: TaskStep, key: LessonKey): { step: TaskStep; shown: ShownOrder[string] } {
  const base = { id: step.id, prompt: step.prompt, scored: step.scored, explanation: "" };
  switch (step.type) {
    case "choice": {
      const options = step.ordered ? step.options : attemptOrder(step.options, key, step.id, "options");
      const reasons = step.reasons ? attemptOrder(step.reasons, key, step.id, "reasons") : undefined;
      return {
        step: {
          ...base,
          type: "choice",
          ordered: step.ordered,
          options: options.map((o) => ({ id: o.id, label: o.label })),
          // Whether a reason part exists is visible from the reasons themselves;
          // which one is right is not. The marker only tells the UI to ask.
          reasons: reasons?.map((r) => ({ id: r.id, label: r.label })),
          correctReason: step.correctReason !== undefined ? "" : undefined,
        },
        shown: { options: options.map((o) => o.id), reasons: reasons?.map((r) => r.id) },
      };
    }
    case "rate": {
      const drawn = drawRateItems(step, key);
      return {
        step: {
          ...base,
          type: "rate",
          scale: step.scale,
          items: drawn.map((i) => ({ id: i.id, label: i.label, materialIndex: i.materialIndex, answer: 1, explain: "", highlight: [] })),
        },
        shown: { items: drawn.map((i) => i.id) },
      };
    }
    case "find":
      return {
        step: { ...base, type: "find", materialIndex: step.materialIndex, targets: [], targetCount: step.targets.length, explainTargets: {} },
        shown: {},
      };
    case "number":
      return { step: { ...base, type: "number", answer: 0, unit: step.unit }, shown: {} };
    case "sort": {
      const items = shuffled(step.items, seedFor(key, step.id, "items"));
      return {
        step: { ...base, type: "sort", boxes: step.boxes, items: items.map((i) => ({ id: i.id, label: i.label })) },
        shown: { items: items.map((i) => i.id) },
      };
    }
    case "order": {
      // Never start in the answer order.
      let items = shuffled(step.items, seedFor(key, step.id, "items"));
      if (items.length > 1 && items.every((it, i) => it.id === step.answer[i])) items = [...items.slice(1), items[0]];
      return {
        step: { ...base, type: "order", items: items.map((i) => ({ id: i.id, label: i.label })), answer: [] },
        shown: { items: items.map((i) => i.id) },
      };
    }
  }
}

export function publicTask(task: TaskSet, key: LessonKey): { task: TaskSet; shown: ShownOrder } {
  const shown: ShownOrder = {};
  const steps = task.steps.map((s) => {
    const p = publicStep(s, key);
    shown[s.id] = p.shown;
    return p.step;
  });
  const { afterTip: _afterTip, ...rest } = task;
  void _afterTip;
  return { task: { ...rest, steps }, shown };
}

/** The lesson for the browser: no answers, no reveal maps, no after-tip. */
export function publicLesson(lesson: StationLesson, key: LessonKey): StationLesson {
  return {
    ...lesson,
    task: publicTask(lesson.task, key).task,
    reveal: { bias: lesson.reveal.bias, default: "" },
  };
}

export interface AnswerKey {
  steps: TaskStep[];
  afterTip: string | null;
}

/** The full, resolved steps: sent only after the student submits. */
export function answerKey(task: TaskSet, goal: { amount: number; months: number } | null): AnswerKey {
  const resolved = resolveTask(task, { goal });
  return { steps: resolved.steps, afterTip: resolved.afterTip ?? null };
}
