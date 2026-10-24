/**
 * 06 F3.3: what a write step's text may touch. The text goes to the
 * student's own profile (profile.writes, keyed "<taskSetId>:<stepId>"); the
 * stored task result keeps only whether something was written. Pure, so the
 * rule is tested without a database.
 */
import type { StepResult } from "./types";
import type { TaskSet } from "./types";

export function separateWrites(
  task: TaskSet,
  answers: Record<string, unknown>,
  steps: StepResult[],
  existing: Record<string, string> | undefined,
): { steps: StepResult[]; writes: Record<string, string> | null } {
  const writeIds = new Set(task.steps.filter((s) => s.type === "write").map((s) => s.id));
  if (writeIds.size === 0) return { steps, writes: null };
  const fresh: Record<string, string> = {};
  for (const id of writeIds) {
    const text = (answers[id] as { text?: unknown } | null | undefined)?.text;
    if (typeof text === "string" && text) fresh[`${task.id}:${id}`] = text;
  }
  return {
    steps: steps.map((st) => (writeIds.has(st.stepId) ? { ...st, answer: { written: !!fresh[`${task.id}:${st.stepId}`] } } : st)),
    writes: Object.keys(fresh).length ? { ...existing, ...fresh } : null,
  };
}
