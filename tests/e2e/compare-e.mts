/**
 * 10 CMP-1 to CMP-6, UI-2 (compare-e): every station's compare screen
 * (/dev/compare, scored on the server from fixtures: all right, some, all
 * wrong), plain fetches:
 *   CMP-1: no sentence of 12+ characters twice; one 進入這個月 (or 完成);
 *   CMP-2: 「這是一種做法」 never on a task with no judgment step;
 *   CMP-3: 你做得好的 / 可以再想想 match the fixture;
 *   CMP-4: an unscored station never says 一致, 得分 or 過關;
 *   CMP-5: the right items are folded (看答對的…), the rest open;
 *   CMP-6: a count (答對 N / M), not a decimal score.
 * Then UI-2 in a browser at 390 × 844: a one-question station's compare
 * screen is at most 3 screens tall.
 *
 *   BASE_URL=http://localhost:3210 npx tsx tests/e2e/compare-e.mts
 */
import { isHiddenTask } from "@/lib/tasks/hidden";
import { allLineContent } from "@/lib/tasks/registry";
import type { TaskStep } from "@/lib/tasks/types";

const BASE = process.env.BASE_URL ?? "http://localhost:3210";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error("local dev server only");

const results: string[] = [];
const check = (ok: boolean, what: string) => results.push(`${ok ? "ok  " : "FAIL"} ${what}`);
const visible = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, "|")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\|+/g, "|");
const judgment = (s: TaskStep) => (s.answerKind ? s.answerKind === "judgment" : s.type === "rate");

const tasks = allLineContent().flatMap((l) => l.lessons.filter((x) => x.placement !== "library" && !isHiddenTask(x.task.id)));
const oneQuestion: string[] = [];
for (const lesson of tasks) {
  const id = lesson.task.id;
  const scored = lesson.task.steps.some((s) => s.scored !== false);
  if (lesson.task.steps.length === 1) oneQuestion.push(id);
  for (const fixture of ["right", "some", "wrong"] as const) {
    const res = await fetch(`${BASE}/dev/compare/${id}?fixture=${fixture}`);
    if (!res.ok) {
      check(false, `${id} ${fixture}: ${res.status}`);
      continue;
    }
    const html = await res.text();
    const main = html.slice(html.indexOf('id="result-title"'));
    const text = visible(main);
    const tag = `${id} ${fixture}`;

    // CMP-1: sentences of 12+ characters once.
    // Answers echoed in 你的答案 / 建議答案 boxes are data, not sentences
    // the screen says: option, reason, item and box labels, and the 你放 rows.
    const labels = new Set(
      lesson.task.steps.flatMap((s) => [
        ...("options" in s ? s.options.map((o) => o.label) : []),
        ...("reasons" in s && s.reasons ? s.reasons.map((r) => r.label) : []),
        ...("items" in s ? s.items.map((it) => it.label) : []),
        ...("boxes" in s ? s.boxes.map((b) => b.label) : []),
      ]),
    );
    const sentences = text
      .split(/[|。！？\n]/)
      .map((x) => x.trim().replace(/^理由：/, ""))
      .filter((x) => [...x].length >= 12 && !labels.has(x) && !x.startsWith("你放："));
    const seen = new Map<string, number>();
    for (const x of sentences) seen.set(x, (seen.get(x) ?? 0) + 1);
    const twice = [...seen].filter(([, n]) => n > 1).map(([x]) => x);
    check(!twice.length, `${tag}: no sentence twice${twice.length ? ` (${twice.slice(0, 2).join(" / ")})` : ""}`);
    const buttons = (html.match(/<button[^>]*>(?:<!-- -->)?(進入這個月|完成)(?:<!-- -->)?(?:<svg[\s\S]*?<\/svg>)?<\/button>/g) ?? []).length;
    check(buttons === 1, `${tag}: one 進入這個月 (${buttons})`);

    // CMP-2
    if (!lesson.task.steps.some(judgment)) check(!text.includes("這是一種做法"), `${tag}: no 「這是一種做法」 on fact steps`);

    // CMP-4, CMP-6
    if (!scored) {
      check(!/一致|得分|過關/.test(text), `${tag}: unscored, no 一致 / 得分 / 過關`);
      check(text.includes("這一站沒有計分，你的想法已經存下來。"), `${tag}: unscored, the one line`);
    } else {
      check(/答對 \d+ \/ \d+/.test(text) && !/得分 \d/.test(text), `${tag}: a count, not a score`);
      // CMP-3
      if (fixture === "right") check(text.includes("這次沒有需要再想的"), `${tag}: nothing to rethink`);
      if (fixture === "wrong") check(!text.includes("你做得好的") && /可以再想想：\|?\d+ 項/.test(text), `${tag}: all to rethink`);
      // CMP-5: right items folded.
      if (text.includes("你做得好的")) check(/<details[^>]*>(?:(?!<\/details>)[\s\S])*?看答對的/.test(main), `${tag}: the right ones are folded`);
    }
  }
}

// UI-2: a one-question station's compare screen at 390 × 844.
const { chromium } = await import("playwright");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
for (const id of oneQuestion) {
  await page.goto(`${BASE}/dev/compare/${id}?fixture=some`, { waitUntil: "networkidle" });
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  check(h <= 3 * 844, `${id}: compare screen ${(h / 844).toFixed(1)} screens tall at 390 (≤ 3)`);
}
await browser.close();

console.log(results.filter((r) => r.startsWith("FAIL")).join("\n"));
const fails = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`compare-e: ${tasks.length} stations, ${results.length} checks, ${fails} failing`);
process.exit(fails ? 1 : 0);
