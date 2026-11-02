import type { SubmitResult } from "@/components/tasks/StationFlow";
import type { TaskStep } from "@/lib/tasks/types";

/** The key's full step in the order the student saw (05 A7). */
export function inShownOrder(pub: TaskStep, key: TaskStep | undefined): TaskStep {
  if (!key) return pub;
  const byId = <T extends { id: string }>(list: T[] | undefined, order: { id: string }[] | undefined): T[] | undefined =>
    list && order ? order.map((o) => list.find((x) => x.id === o.id)).filter((x): x is T => !!x) : list;
  if (key.type === "choice" && pub.type === "choice") {
    return { ...key, options: byId(key.options, pub.options) ?? key.options, reasons: byId(key.reasons, pub.reasons) };
  }
  if (key.type === "rate" && pub.type === "rate") return { ...key, items: byId(key.items, pub.items) ?? key.items, drawCount: undefined };
  if (key.type === "sort" && pub.type === "sort") return { ...key, items: byId(key.items, pub.items) ?? key.items };
  if (key.type === "order" && pub.type === "order") return { ...key, items: byId(key.items, pub.items) ?? key.items };
  return key;
}

/** Points as earned (05 A8.4): a rating step counts each file. */
export function displayScore(steps: TaskStep[], details: SubmitResult["details"]): { score: number; total: number } {
  let score = 0;
  let total = 0;
  steps.forEach((step, i) => {
    const d = details[i];
    if (!d || !d.scored) return;
    if (step.type === "rate" && d.perItem?.length) {
      score += d.perItem.reduce((a, p) => a + p.credit, 0);
      total += d.perItem.length;
    } else {
      score += d.credit;
      total += 1;
    }
  });
  return { score, total };
}
