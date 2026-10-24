/**
 * 06 F3.3: a write step is never scored, its text is plain and cut to the
 * limit, the page never carries the model reply or the self-check, and the
 * text goes to the student's own profile only, never into the task result.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { publicTask } from "@/lib/tasks/publicLesson";
import { findTaskSet } from "@/lib/tasks/registry";
import { sanitizeAnswers } from "@/lib/tasks/sanitize";
import { scoreTask } from "@/lib/tasks/scoring";
import type { WriteStep } from "@/lib/tasks/types";
import { separateWrites } from "@/lib/tasks/writes";

const found = findTaskSet("xinyong.bank.v1")!;
const task = found.task;
const write = task.steps.find((s) => s.type === "write") as WriteStep;

test("你是銀行 has one write step, never scored", () => {
  assert.ok(write);
  assert.equal(write.scored, false);
  const answers = sanitizeAnswers(task, { [write.id]: { text: "不核准，因為卡費在循環。" } });
  const score = scoreTask(task, answers, {});
  const step = score.steps.find((s) => s.stepId === write.id)!;
  assert.equal(score.total, task.steps.filter((s) => s.scored !== false).length);
  assert.ok(step);
});

test("write text is plain, without control or invisible characters, and cut to maxChars", () => {
  const long = "我".repeat(200);
  const a = sanitizeAnswers(task, { [write.id]: { text: `  第一句\u0000​<b>粗</b>${long}` } });
  const text = (a[write.id] as { text: string }).text;
  assert.ok(!/[\u0000​]/.test(text));
  assert.equal([...text].length, write.maxChars ?? 80);
  assert.ok(text.includes("<b>")); // kept as text; the page renders it as text, never HTML
  assert.ok(!sanitizeAnswers(task, { [write.id]: { text: 5 } })[write.id]);
});

test("the public page carries no model reply and no self-check", () => {
  const pub = publicTask(task, { taskSetId: task.id, studentId: "s", attempt: 1 }).task;
  const w = pub.steps.find((s) => s.id === write.id) as WriteStep;
  assert.equal(w.modelAnswer, "");
  assert.deepEqual(w.selfCheck, []);
  assert.ok(!JSON.stringify(pub).includes(write.modelAnswer));
});

test("the text goes to profile.writes only; the task result keeps whether it was written", () => {
  const answers = sanitizeAnswers(task, { [write.id]: { text: "不核准，因為卡費在循環。" } });
  const score = scoreTask(task, answers, {});
  const out = separateWrites(task, answers, score.steps, { "other.v1:s9": "舊的" });
  assert.ok(!JSON.stringify(out.steps).includes("卡費在循環"));
  assert.deepEqual(out.steps.find((s) => s.stepId === write.id)?.answer, { written: true });
  assert.deepEqual(out.writes, { "other.v1:s9": "舊的", [`${task.id}:${write.id}`]: "不核准，因為卡費在循環。" });
  const none = separateWrites(task, {}, score.steps, undefined);
  assert.equal(none.writes, null);
});
