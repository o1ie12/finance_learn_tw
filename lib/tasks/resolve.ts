/**
 * Resolve what content leaves to the engine before a task is scored or its
 * answers are shown (05 A5): a choice whose correct option is computed
 * (`correctNearest`) gets its `correct` id and the engine's number in its
 * explanation. Pure; the same on the server and in tests.
 */

import { resolveNumber, type ComputeContext } from "./compute";
import type { TaskSet, TaskStep } from "./types";

function formatNT(n: number): string {
  return `NT$${Math.round(n).toLocaleString("en-US")}`;
}

export function resolveStep(step: TaskStep, ctx: ComputeContext = {}): TaskStep {
  if (step.type !== "choice" || !step.correctNearest) return step;
  const value = resolveNumber(step.correctNearest.ref, ctx);
  if (value === null) return step;
  let best: string | undefined;
  let bestGap = Infinity;
  for (const [id, v] of Object.entries(step.correctNearest.values)) {
    const gap = Math.abs(Math.log(Math.max(v, 1e-9)) - Math.log(Math.max(value, 1e-9)));
    if (gap < bestGap) {
      bestGap = gap;
      best = id;
    }
  }
  return { ...step, correct: best, explanation: step.explanation.replaceAll("{value}", formatNT(value)) };
}

export function resolveTask(task: TaskSet, ctx: ComputeContext = {}): TaskSet {
  return task.steps.some((s) => s.type === "choice" && s.correctNearest)
    ? { ...task, steps: task.steps.map((s) => resolveStep(s, ctx)) }
    : task;
}
