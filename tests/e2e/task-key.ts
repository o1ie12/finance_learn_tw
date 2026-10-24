/**
 * Writes the answer key tests/e2e/task-e.mjs plays from, for any task set:
 * each step's right answer (and a wrong one), from the finished content.
 *   npx tsx tests/e2e/task-key.ts <taskSetId> <out.json>
 */
import { writeFileSync } from "node:fs";
import { resolveNumber } from "@/lib/tasks/compute";
import { findTaskSet } from "@/lib/tasks/registry";
import { resolveTask } from "@/lib/tasks/resolve";

const [, , id, out] = process.argv;
const found = findTaskSet(id);
if (!found) throw new Error(`no task set ${id}`);
const task = resolveTask(found.task, { goal: null });
const steps = task.steps.map((s) => {
  switch (s.type) {
    case "choice":
      return {
        type: "choice",
        right: s.options.find((o) => o.id === s.correct)?.label ?? s.options[0].label,
        reason: s.reasons?.find((r) => r.id === s.correctReason)?.label ?? s.reasons?.[0]?.label ?? null,
        hasReasons: (s.reasons?.length ?? 0) >= 2,
      };
    case "rate":
      return { type: "rate", items: s.items.map((i) => ({ label: i.label, answer: i.answer })) };
    case "find":
      return { type: "find", targets: s.targets };
    case "number":
      return { type: "number", value: resolveNumber(s.answer, {}) };
    case "sort":
      return { type: "sort", items: s.items.map((i) => ({ label: i.label, box: s.boxes.find((b) => b.id === i.box)?.label ?? null })) };
    case "order":
      return { type: "order", answer: s.answer.map((a) => s.items.find((i) => i.id === a)!.label) };
    case "write":
      return { type: "write" };
  }
});
writeFileSync(out, JSON.stringify({ id, title: task.title, steps }, null, 1));
