import { test } from "node:test";
import assert from "node:assert/strict";
import { sentenceCount, validateCopyOnly, validateLine } from "@/lib/tasks/validate";
import { content as xinyong } from "@/content/lines/xinyong";
import { profilePatchForTask } from "@/lib/tasks/profileWrites";

test("sentenceCount counts sentence endings, with or without a final mark", () => {
  assert.equal(sentenceCount("一句。"), 1);
  assert.equal(sentenceCount("一句。兩句。"), 2);
  assert.equal(sentenceCount("一句。兩句。三句"), 3);
  assert.equal(sentenceCount("「他說：『好。』」"), 1);
  assert.equal(sentenceCount(""), 0);
});

test("validator: scored sort items need an explanation; reveals and briefs ≤ 2 sentences", () => {
  const line = structuredClone(xinyong);
  const lesson = line.lessons.find((l) => l.task.steps.some((s) => s.type === "sort"))!;
  const sort = lesson.task.steps.find((s) => s.type === "sort")!;
  if (sort.type === "sort") sort.items[0].explain = "";
  lesson.reveal.default = "一。二。三。";
  lesson.task.brief.situation = "一。二。三。";
  const errors = validateLine(line, "x.ts", "xinyong").filter((i) => i.level === "error").map((i) => i.message);
  assert.ok(errors.some((m) => /scored sort item has no explanation/.test(m)));
  assert.ok(errors.some((m) => /reveal text has 3 sentences/.test(m)));
  assert.ok(errors.some((m) => /brief situation is longer than 2 sentences/.test(m)));
});

test("global copy files are checked for em dashes and listed names", () => {
  const issues = validateCopyOnly({ a: ["好", "不好——真的"], b: { c: "和虛構測試基金會一起" } }, "g.ts", ["虛構測試基金會"]);
  assert.equal(issues.length, 2);
});

test("信用線 statement task keeps the option ids the creditRecord mapping reads", () => {
  const lesson = xinyong.lessons.find((l) => l.task.kind === "xinyong_statement_v1")!;
  const s3 = lesson.task.steps.find((s) => s.id === "s3")!;
  assert.equal(s3.type, "choice");
  if (s3.type !== "choice") return;
  assert.deepEqual(s3.options.map((o) => o.id).sort(), ["full", "min", "none", "partial"]);
  for (const o of s3.options) {
    const patch = profilePatchForTask("xinyong_statement_v1", { s3: { option: o.id } }, lesson.task);
    assert.ok(patch.creditRecord, `option ${o.id} maps to a credit record`);
  }
  // A crafted option id writes nothing (never an invalid value).
  assert.deepEqual(profilePatchForTask("xinyong_statement_v1", { s3: { option: "toString" } }, lesson.task), {});
});

import { mergeProfile } from "@/lib/studentProfile";

test("a malformed profile patch never wipes the stored profile", () => {
  const stored = { monthlyIncome: 32_000, savedTools: ["花錢三問"] };
  const merged = mergeProfile(stored, { creditRecord: (() => 0) as unknown as "good" });
  assert.equal(merged.monthlyIncome, 32_000);
  assert.deepEqual(merged.savedTools, ["花錢三問"]);
  assert.equal(merged.creditRecord, undefined);
});
