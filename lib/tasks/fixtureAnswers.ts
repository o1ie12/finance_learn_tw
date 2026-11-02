/**
 * Answers for the compare-screen fixtures (10 compare-e, dev only): "right"
 * gives every step its suggested answer, "wrong" sends nothing, "some" is
 * right except the first scored step (and half of a sort or rate's items).
 */
import { resolveNumber } from "./compute";
import { resolveTask } from "./resolve";
import type { TaskSet, TaskStep } from "./types";

export type Fixture = "right" | "wrong" | "some";

const first = (a?: (string | { option: string; credit: number })[]) => {
  const x = a?.[0];
  return typeof x === "string" ? x : x?.option;
};

function rightAnswer(step: TaskStep, half: boolean): unknown {
  switch (step.type) {
    case "choice":
      return half ? { option: step.options.find((o) => o.id !== step.correct)?.id } : { option: step.correct, reason: step.correctReason };
    case "rate":
      return { ratings: Object.fromEntries(step.items.map((it, i) => [it.id, half && i % 2 === 0 ? (it.answer === 1 ? 3 : 1) : it.answer])) };
    case "find":
      return { selected: half ? [] : [...step.targets] };
    case "number": {
      const v = resolveNumber(step.answer, { goal: null });
      return { value: half || v === null ? (v ?? 0) + 99999 : v };
    }
    case "sort":
      return {
        placements: Object.fromEntries(
          step.items.map((it, i) => {
            const right = it.box ?? first(it.accept) ?? step.boxes[0].id;
            return [it.id, half && i % 2 === 0 ? (step.boxes.find((b) => b.id !== right)?.id ?? right) : right];
          }),
        ),
      };
    case "order":
      return { order: half ? [...step.answer].reverse() : [...step.answer] };
    case "write":
      return { text: "先繳清這期的卡費，再看下個月的預算。" };
  }
}

export function fixtureAnswers(raw: TaskSet, fixture: Fixture): Record<string, unknown> {
  if (fixture === "wrong") return {};
  const task = resolveTask(raw, { goal: null });
  const firstScored = task.steps.findIndex((s) => s.scored !== false);
  return Object.fromEntries(task.steps.map((s, i) => [s.id, rightAnswer(s, fixture === "some" && i === firstScored)]));
}
