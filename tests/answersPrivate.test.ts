/**
 * 05 A2: no answer reaches the browser before the student submits; 05 A7:
 * options are shuffled per attempt so the right one is not always first.
 * The page hands the browser only `lessonForPage` (publicLesson); these
 * tests check that object for every task set in the content.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { allLineContent, afterLesson } from "@/lib/tasks/registry";
import { publicLesson, answerKey } from "@/lib/tasks/publicLesson";
import type { StationLesson, TaskStep } from "@/lib/tasks/types";

function allLessons(): StationLesson[] {
  const out: StationLesson[] = [];
  for (const line of allLineContent()) {
    out.push(...line.lessons);
    const after = afterLesson(line.slug);
    if (after) out.push(after);
  }
  return out;
}

/** Strings that only the answer key may carry. */
function secrets(lesson: StationLesson): string[] {
  const out: string[] = [];
  const add = (s: string | undefined) => {
    if (s && s.trim().length >= 6) out.push(s);
  };
  for (const st of lesson.task.steps as TaskStep[]) {
    add(st.explanation);
    if (st.type === "choice") st.options.forEach((o) => add(o.explain));
    if (st.type === "rate") st.items.forEach((i) => add(i.explain));
    if (st.type === "find") Object.values(st.explainTargets).forEach(add);
    if (st.type === "sort") st.items.forEach((i) => add(i.explain));
    // 06 F3.3: the model reply and the self-check come only after submit.
    if (st.type === "write") {
      add(st.modelAnswer);
      st.selfCheck.forEach((c) => add(c.length >= 6 ? c : `${c}　`));
    }
  }
  add(lesson.task.afterTip);
  add(lesson.reveal.default);
  Object.values(lesson.reveal.byHookOption ?? {}).forEach(add);
  Object.values(lesson.reveal.byOutcome ?? {}).forEach(add);
  // Text the lesson shows openly anyway (a lesson card reused as an
  // explanation) is not a secret.
  // So are the visible choices (an explanation that repeats the right
  // reason's words does not say which reason is right).
  const labels = lesson.task.steps.flatMap((st) =>
    st.type === "choice" ? [...st.options.map((o) => o.label), ...(st.reasons ?? []).map((r) => r.label)] : [],
  );
  const open = JSON.stringify([lesson.lessonCards, lesson.hook, lesson.task.brief, lesson.task.materials, lesson.takeaway, labels]);
  return out.filter((t) => !open.includes(t));
}

const KEY = { studentId: "s-test", attempt: 1 };

test("no answer, explanation or reveal text is in any public lesson", () => {
  let checked = 0;
  for (const lesson of allLessons()) {
    const pub = JSON.stringify(publicLesson(lesson, { taskSetId: lesson.task.id, ...KEY }));
    for (const secret of secrets(lesson)) {
      assert.ok(!pub.includes(secret), `${lesson.task.id}: public lesson leaks "${secret.slice(0, 30)}…"`);
    }
    for (const field of ['"correct":"', '"correctReason":"r', '"accept":', '"alsoFull":', '"explainTargets":{"', '"correctNearest":', '"byOutcome":', '"byHookOption":', '"afterTip":']) {
      assert.ok(!pub.includes(field), `${lesson.task.id}: public lesson carries ${field}`);
    }
    const p = publicLesson(lesson, { taskSetId: lesson.task.id, ...KEY });
    for (const st of p.task.steps) {
      if (st.type === "rate") assert.ok(st.items.every((i) => i.highlight.length === 0 && i.explain === ""));
      if (st.type === "find") assert.equal(st.targets.length, 0);
      if (st.type === "order") assert.equal(st.answer.length, 0);
      if (st.type === "sort") assert.ok(st.items.every((i) => i.box === undefined));
    }
    checked++;
  }
  assert.ok(checked >= 20);
});

test("the answer key restores every answer the public lesson removed", () => {
  for (const lesson of allLessons()) {
    const key = answerKey(lesson.task, null);
    assert.equal(key.steps.length, lesson.task.steps.length);
    for (const st of key.steps) {
      if (st.type === "choice" && st.scored !== false) assert.ok(st.correct, `${lesson.task.id}/${st.id} has a correct option in the key`);
    }
  }
});

test("05 A7: the correct option is spread across positions (none above 40%)", () => {
  for (const lesson of allLessons()) {
    for (const st of lesson.task.steps) {
      if (st.type !== "choice" || st.ordered || st.options.length < 3) continue;
      const correct = answerKey({ ...lesson.task, steps: [st] }, null).steps[0];
      if (correct.type !== "choice" || !correct.correct) continue;
      const counts = new Array(st.options.length).fill(0);
      for (let a = 1; a <= 100; a++) {
        const p = publicLesson(lesson, { taskSetId: lesson.task.id, studentId: "s-one", attempt: a });
        const ps = p.task.steps.find((x) => x.id === st.id)!;
        if (ps.type === "choice") counts[ps.options.findIndex((o) => o.id === correct.correct)]++;
      }
      assert.ok(Math.max(...counts) <= 40, `${lesson.task.id}/${st.id}: positions ${counts.join(",")}`);
    }
  }
});

test("05 A2: no client component imports the content or the answer data", () => {
  const walk = (d: string, out: string[] = []): string[] => {
    for (const n of readdirSync(d)) {
      const p = join(d, n);
      if (statSync(p).isDirectory()) walk(p, out);
      else if (/\.tsx?$/.test(n)) out.push(p);
    }
    return out;
  };
  const offenders = [...walk("components"), ...walk("app")].filter((f) => {
    const src = readFileSync(f, "utf8");
    if (!/^["']use client["']/m.test(src)) return false;
    if (f.includes(join("components", "tasks", "preview"))) return false; // dev-only demo
    // The line files and the registry hold answers; content/global.ts is public copy.
    return /from ["']@\/content["']|from ["']@\/content\/lines|from ["']@\/lib\/tasks\/registry["']/.test(src);
  });
  assert.deepEqual(offenders, []);
});

import { findTaskSet } from "@/lib/tasks/registry";
import { cardInterestIfMinimum } from "@/lib/tasks/compute";
import { scoreStatus } from "@/components/tasks/answers";

test("05 A5: the interest question's answer comes from the 信用線 engine", () => {
  const found = findTaskSet("xinyong.statement.v1")!;
  const key = answerKey(found.task, null);
  const s4 = key.steps.find((s) => s.id === "s4")!;
  const engine = cardInterestIfMinimum(6390);
  assert.equal(s4.type, "choice");
  if (s4.type !== "choice") return;
  assert.ok(s4.explanation.includes(`NT$${engine.toLocaleString("en-US")}`), "the model answer shows the engine's number");
  const nearest = Object.entries(s4.correctNearest!.values).sort(
    (a, b) => Math.abs(Math.log(a[1]) - Math.log(engine)) - Math.abs(Math.log(b[1]) - Math.log(engine)),
  )[0][0];
  assert.equal(s4.correct, nearest);
});

test("05 A6: the score line matches whether the station is done", () => {
  const fail1 = scoreStatus("station", { total: 4, passed: false, stationDone: false });
  const fail2 = scoreStatus("station", { total: 4, passed: false, stationDone: true });
  assert.equal(fail1, "還差一點。再試一次；第二次不論分數，這一站都會完成。");
  assert.equal(fail2, "這一站完成了。");
  assert.equal(scoreStatus("station", { total: 4, passed: true, stationDone: true }), "過關了，這一站完成。");
});
