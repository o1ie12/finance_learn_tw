/**
 * Writes the answer key tests/e2e/xinyong-retry.mjs plays from: for 信用線
 * stations 4 and 7, each step's right and wrong answers, from the content.
 *   npx tsx tests/e2e/xinyong-key.ts /tmp/xinyong-key.json
 */
import { writeFileSync } from "node:fs";
import { lessonForStation } from "@/lib/tasks/registry";
import { resolveTask } from "@/lib/tasks/resolve";

const out: Record<number, unknown[]> = {};
for (const n of [4, 7]) {
  const task = resolveTask(lessonForStation("xinyong", n)!.task, { goal: null });
  out[n] = task.steps.map((s) => {
    if (s.type === "rate") return { type: "rate", items: s.items.map((i) => ({ label: i.label, answer: i.answer })) };
    if (s.type === "find") return { type: "find", targets: s.targets };
    if (s.type === "choice") {
      const reason = (right: boolean) => s.reasons?.find((r) => (r.id === s.correctReason) === right)?.label ?? null;
      return {
        type: "choice",
        right: s.options.find((o) => o.id === s.correct)!.label,
        wrong: s.options.find((o) => o.id !== s.correct)!.label,
        correctReason: reason(true),
        wrongReason: reason(false),
      };
    }
    return { type: s.type };
  });
}
writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
