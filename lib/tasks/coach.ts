/**
 * Deterministic coach text for task results (03 §4: one branch per new
 * kind, same pattern as the existing line stubs). It names the student's
 * actual misses and the bias the reveal showed them; no LLM call.
 */

import { findTaskSet } from "./registry";

export interface TaskOutcomeLike {
  taskSetId: string;
  score: number;
  total: number;
  steps: { stepId: string; correct: number; answer?: unknown }[];
  revealShown: string;
}

export function taskCoachText(outcome: TaskOutcomeLike): string {
  const found = findTaskSet(outcome.taskSetId);
  if (!found) return "這是一次任務練習的回饋。想更深入，回到這條線的站點再看一次。";
  const { task, lesson } = found;
  const pct = outcome.total === 0 ? 100 : Math.round((outcome.score / outcome.total) * 100);
  const missed = outcome.steps
    .filter((s) => s.correct < 1)
    .map((s) => ({ s, step: task.steps.find((t) => t.id === s.stepId) }))
    .filter((x): x is { s: (typeof outcome.steps)[number]; step: NonNullable<typeof x.step> } => !!x.step && x.step.scored !== false);
  const head = `「${task.title}」你拿到 ${pct} 分。`;
  const misses = missed.length
    ? `可以再想一次的是：${missed
        .slice(0, 2)
        .map(({ s, step }) => `「${step.prompt}」${pickedText(step, s.answer)}${step.explanation ? `，${step.explanation}` : ""}`)
        .join("；")}`
    : "每一步都答對了。";
  const bias = `這一站的心理陷阱是「${lesson.reveal.bias}」：${outcome.revealShown}`;
  const tool = `記住「${lesson.takeaway.name}」：${lesson.takeaway.lines.join("、")}。`;
  return [head, misses, bias, tool].join("");
}

/** What the student actually answered, in words, for the coach (03 §4). */
function pickedText(step: import("./types").TaskStep, answer: unknown): string {
  const a = (answer && typeof answer === "object" ? answer : {}) as Record<string, unknown>;
  if (step.type === "choice" && typeof a.option === "string") {
    const label = step.options.find((o) => o.id === a.option)?.label;
    return label ? `你選了「${label}」` : "";
  }
  if (step.type === "number" && (typeof a.value === "number" || typeof a.value === "string")) {
    return `你填了 ${a.value}`;
  }
  return "";
}
