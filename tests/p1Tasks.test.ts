/**
 * 06 P1 tasks 1 to 5: every figure comes from the engine, no {{token}} is
 * left in the finished content, and each task's right answer is the one the
 * engine's numbers say.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { CONTENT_BY_SLUG } from "@/content";
import { MANDATORY_AUTO_INSURANCE } from "@/lib/insurance";
import { budgetGap, debtPayoff, ownershipCost, savingsFV } from "@/lib/tasks/compute";
import { findTaskSet, lessonForStation } from "@/lib/tasks/registry";
import { resolveTask } from "@/lib/tasks/resolve";
import type { ChoiceStep, NumberStep, OrderStep } from "@/lib/tasks/types";
import { resolveNumber } from "@/lib/tasks/compute";

const P1 = ["qixin.budgetgap.v1", "qixin.scooter.v1", "cunqian.compound.v1", "xinyong.payoff.v1", "baoxian.scooter.v1"];

test("no {{figure}} token is left anywhere in the finished content", () => {
  assert.ok(!/\{\{\w+\}\}/.test(JSON.stringify(CONTENT_BY_SLUG)));
});

test("all five P1 tasks are registered and placed", () => {
  for (const id of P1) assert.ok(findTaskSet(id), id);
  assert.equal(lessonForStation("cunqian", 3)?.task.id, "cunqian.compound.v1");
  assert.equal(findTaskSet("cunqian.rate.v1")?.lesson.placement, "library");
});

test("預算缺口: the gap and the monthly amount are the engine's", () => {
  const t = findTaskSet("qixin.budgetgap.v1")!.task;
  const [s1, s2] = t.steps as NumberStep[];
  const gap = budgetGap(34_000, 31_800, [2_400, 12_000, 4_000, 3_500, 3_600, 4_500]);
  assert.equal(gap, 3_600);
  assert.equal(resolveNumber(s1.answer), gap);
  assert.equal(resolveNumber(s2.answer), gap / 12);
  assert.ok(s1.explanation.includes("NT$3,600"));
});

test("機車的真實成本: first-year totals, and the three-year option matches the engine", () => {
  const t = findTaskSet("qixin.scooter.v1")!.task;
  const [s1, s2] = t.steps as NumberStep[];
  assert.equal(resolveNumber(s1.answer), ownershipCost(72_000, [600, 6_000, 1_500, 3_600], 1));
  assert.equal(resolveNumber(s2.answer), ownershipCost(30_000, [600, 7_200, 6_000, 3_600], 1));
  const diff = ownershipCost(72_000, [600, 6_000, 1_500, 3_600], 3) - ownershipCost(30_000, [600, 7_200, 6_000, 3_600], 3, [5_000]);
  const s3 = t.steps[2] as ChoiceStep;
  const right = s3.options.find((o) => o.id === s3.correct)!;
  assert.ok(diff > 0 && right.label.includes(`NT$${Math.round(diff / 10_000)} 萬`), `${right.label} vs ${diff}`);
});

test("複利與 72 法則: the nearest option is the engine's, and the rule of 72 uses the repo rates", () => {
  const lesson = lessonForStation("cunqian", 3)!;
  const resolved = resolveTask(lesson.task, {});
  const [s1, s2] = resolved.steps as ChoiceStep[];
  assert.equal(s1.correct, "m450"); // savingsFV(2000, 6%, 42 y)
  assert.ok(Math.abs(savingsFV(2_000, 0.06, 42) - 4_500_000) < 100_000);
  assert.equal(s2.correct, "m220");
  const [s3, s4] = (lesson.task.steps.slice(2) as NumberStep[]).map((s) => resolveNumber(s.answer));
  assert.equal(s3, 72 / 15);
  assert.ok(Math.abs((s4 ?? 0) - 72 / 1.7) < 1e-9);
});

test("雪球還是雪崩: highest rate first costs the least interest; the order answer is by rate", () => {
  const t = findTaskSet("xinyong.payoff.v1")!.task;
  const debts = [
    { balance: 30_000, annualRate: 0.15, min: 1_000 },
    { balance: 120_000, annualRate: 0.07, min: 2_500 },
    { balance: 200_000, annualRate: 0.00775, min: 2_000 },
    { balance: 10_000, annualRate: 0, min: 500 },
  ];
  const aval = debtPayoff(debts, 12_000, [0, 1, 2, 3]);
  const snow = debtPayoff(debts, 12_000, [3, 0, 1, 2]);
  const mins = debtPayoff(debts, 6_000, []);
  assert.ok(aval.interest < snow.interest && snow.interest < mins.interest);
  assert.deepEqual((t.steps[0] as OrderStep).answer, ["card", "personal", "student", "friend"]);
  assert.ok(t.steps[0].explanation.includes(`NT$${aval.interest.toLocaleString("en-US")}`));
  assert.equal((t.steps[1] as ChoiceStep).correct, "call");
});

test("機車保險三層: the 強制險 amounts are the sourced constant (115/7/1)", () => {
  const lesson = findTaskSet("baoxian.scooter.v1")!.lesson;
  const text = JSON.stringify(lesson);
  assert.ok(text.includes(`NT$${MANDATORY_AUTO_INSURANCE.medicalPerVictim.toLocaleString("en-US")}`));
  assert.ok(text.includes(`NT$${MANDATORY_AUTO_INSURANCE.deathPerVictim.toLocaleString("en-US")}`));
  assert.ok(!text.includes("2,000,000"), "the pre-2026-07 amount must not appear");
});
