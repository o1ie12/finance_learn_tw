/**
 * The task engine's pure logic (03 §5.2): scoring per step type, reveal pick
 * order, the seeded RateStep draw, formula answers, and content validation.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  cardInterestIfMinimum,
  cardMinimum,
  depositInterest,
  goalMonthly,
  netPay,
  resolveNumber,
  studentLoanMonthly,
} from "@/lib/tasks/compute";
import { scoreStep, scoreTask, kendallDistance, parseNumberAnswer } from "@/lib/tasks/scoring";
import { pickReveal, pickRevealWithSource } from "@/lib/tasks/reveal";
import { drawIndices, drawRateItems, drawSeed } from "@/lib/tasks/draw";
import { validateAll, validateLine, charLength } from "@/lib/tasks/validate";
import {
  computeStudentLoan,
  SCHOOL_OPTIONS,
  HOUSING_OPTIONS,
} from "@/lib/sims/studentLoan";
import { computeRound, NO_CARRY } from "@/lib/sims/creditCard";
import type {
  BiasReveal,
  ChoiceStep,
  FindStep,
  LineContent,
  NumberStep,
  OrderStep,
  RateStep,
  SortStep,
  TaskSet,
} from "@/lib/tasks/types";

const near = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≈ ${b}`);

// --- compute ---------------------------------------------------------------------

test("compute: card statement of 6,390 → minimum 600, interest 107 next statement", () => {
  assert.equal(cardMinimum(6390), 600);
  assert.equal(cardInterestIfMinimum(6390), 107);
  // Same as the 信用線 simulation's own round math: pay the minimum on a
  // first statement of 6,390, the next statement bills 107.
  const r1 = computeRound({ month: 1, label: "", reason: "", newCharge: 6390 }, NO_CARRY, "minimum");
  const r2 = computeRound({ month: 2, label: "", reason: "", newCharge: 0 }, r1.carryState, "full");
  assert.equal(r1.minimumPayment, 600);
  assert.equal(r2.interestAccrued, 107);
});

test("compute: netPay, depositInterest, goalMonthly", () => {
  assert.equal(netPay(32000), 30704);
  assert.equal(depositInterest(50000), 850);
  assert.equal(goalMonthly({ amount: 30000, months: 12 }), 2500);
  assert.equal(goalMonthly({ amount: 30001, months: 12 }), 2600);
  assert.equal(goalMonthly(null), null);
  assert.equal(goalMonthly({ amount: 30000, months: 0 }), null);
});

test("compute: studentLoanMonthly equals the 學貸 simulation's monthlyRepayment", () => {
  // studentLoan.ts's amortised() is private; compute.ts copies it. Pin the
  // copy against every loan the simulation can produce.
  for (const school of SCHOOL_OPTIONS) {
    for (const housing of HOUSING_OPTIONS) {
      for (let pct = 0; pct <= 100; pct += 5) {
        const out = computeStudentLoan({
          school: school.id,
          housing: housing.id,
          loanCoversPct: pct,
          startingSalary: 32000,
          salaryFromCareer: false,
        });
        assert.equal(studentLoanMonthly(out.loanAmount), out.monthlyRepayment);
      }
    }
  }
  assert.equal(studentLoanMonthly(400000), 3465);
  assert.equal(studentLoanMonthly(0), 0);
});

test("compute: resolveNumber", () => {
  assert.equal(resolveNumber(1234), 1234);
  assert.equal(resolveNumber({ fn: "netPay", gross: 32000 }), 30704);
  assert.equal(resolveNumber({ fn: "netPayMinus", gross: 32000, minus: 704 }), 30000);
  assert.equal(resolveNumber({ fn: "cardMinimum", total: 6390 }), 600);
  assert.equal(resolveNumber({ fn: "cardInterestIfMinimum", total: 6390 }), 107);
  assert.equal(resolveNumber({ fn: "studentLoanMonthly", principal: 400000 }), studentLoanMonthly(400000));
  assert.equal(resolveNumber({ fn: "depositInterest", principal: 50000 }), 850);
  assert.equal(resolveNumber({ fn: "goalMonthly" }, { goal: { amount: 30000, months: 12 } }), 2500);
  assert.equal(resolveNumber({ fn: "goalMonthly" }, {}), null);
  assert.equal(resolveNumber(NaN), null);
});

// --- scoring -----------------------------------------------------------------------

const choice: ChoiceStep = {
  id: "c1",
  type: "choice",
  prompt: "p",
  explanation: "e",
  options: [
    { id: "a", label: "A" },
    { id: "b", label: "B" },
    { id: "c", label: "C" },
  ],
  correct: "a",
  accept: [{ option: "b", credit: 0.5 }],
};

test("score choice: no reason part → 1.0 on the choice, accept gives partial", () => {
  assert.equal(scoreStep(choice, { option: "a" }).credit, 1);
  assert.equal(scoreStep(choice, { option: "b" }).credit, 0.5);
  assert.equal(scoreStep(choice, { option: "c" }).credit, 0);
  assert.equal(scoreStep(choice, { option: "zzz" }).credit, 0);
  assert.equal(scoreStep(choice, null).credit, 0);
  assert.equal(scoreStep(choice, "a").credit, 0);
  const full = scoreStep({ ...choice, accept: ["c"] }, { option: "c" });
  assert.equal(full.credit, 1);
});

test("score choice: with reasons → 0.5 choice + 0.5 reason", () => {
  const withReasons: ChoiceStep = {
    ...choice,
    accept: undefined,
    reasons: [
      { id: "r1", label: "R1" },
      { id: "r2", label: "R2" },
      { id: "r3", label: "R3" },
    ],
    correctReason: "r2",
  };
  assert.equal(scoreStep(withReasons, { option: "a", reason: "r2" }).credit, 1);
  assert.equal(scoreStep(withReasons, { option: "a", reason: "r1" }).credit, 0.5);
  assert.equal(scoreStep(withReasons, { option: "c", reason: "r2" }).credit, 0.5);
  assert.equal(scoreStep(withReasons, { option: "c", reason: "r3" }).credit, 0);
  // Only one reason: no reason part.
  const oneReason = { ...withReasons, reasons: [{ id: "r2", label: "R2" }] };
  assert.equal(scoreStep(oneReason, { option: "a" }).credit, 1);
});

const rate: RateStep = {
  id: "r",
  type: "rate",
  prompt: "p",
  explanation: "e",
  scale: [
    { value: 1, label: "核准" },
    { value: 2, label: "條件" },
    { value: 3, label: "婉拒" },
  ],
  items: [
    { id: "i1", label: "1", materialIndex: 0, answer: 1, explain: "x", highlight: [] },
    { id: "i2", label: "2", materialIndex: 0, answer: 3, explain: "x", highlight: [] },
    { id: "i3", label: "3", materialIndex: 0, answer: 1, alsoFull: [2], explain: "x", highlight: [] },
    { id: "i4", label: "4", materialIndex: 0, answer: 2, explain: "x", highlight: [] },
  ],
};

test("score rate: full exact or alsoFull, half off by one, zero otherwise", () => {
  assert.equal(scoreStep(rate, { ratings: { i1: 1, i2: 3, i3: 2, i4: 2 } }).credit, 1);
  const partial = scoreStep(rate, { ratings: { i1: 2, i2: 3, i3: 3, i4: 1 } });
  // i1 off by one 0.5, i2 1, i3 off by two from answer 1 → 0, i4 off by one 0.5
  near(partial.credit, 2 / 4);
  assert.deepEqual(
    partial.perItem?.map((p) => p.credit),
    [0.5, 1, 0, 0.5],
  );
  assert.equal(scoreStep(rate, { ratings: { i1: 3, i2: 1, i3: 3 } }).credit, 0);
  assert.equal(scoreStep(rate, { ratings: { i1: 7 } }).credit, 0);
});

test("score rate: drawn items only count", () => {
  const many: RateStep = {
    ...rate,
    drawCount: 2,
    items: Array.from({ length: 18 }, (_, i) => ({
      id: `f${i}`,
      label: `${i}`,
      materialIndex: 0,
      answer: 1 as const,
      explain: "x",
      highlight: [],
    })),
  };
  const key = { taskSetId: "xinyong.bank.v1", studentId: "s1", attempt: 1 };
  const shown = drawRateItems(many, key);
  assert.equal(shown.length, 2);
  const ratings = Object.fromEntries(shown.map((it) => [it.id, 1]));
  const s = scoreStep(many, { ratings }, { ...key });
  assert.equal(s.credit, 1);
  assert.equal(s.perItem?.length, 2);
});

const find: FindStep = {
  id: "f",
  type: "find",
  prompt: "找出最低應繳金額",
  explanation: "e",
  materialIndex: 0,
  targets: ["minimumDue", "dueDate"],
  explainTargets: { minimumDue: "x", dueDate: "y" },
};

test("score find: (hits − false clicks) / targets, floored at 0", () => {
  assert.equal(scoreStep(find, { selected: ["minimumDue", "dueDate"] }).credit, 1);
  assert.equal(scoreStep(find, { selected: ["minimumDue"] }).credit, 0.5);
  assert.equal(scoreStep(find, { selected: ["minimumDue", "dueDate", "bank"] }).credit, 0.5);
  assert.equal(scoreStep(find, { selected: ["bank", "limit", "minimumDue"] }).credit, 0);
  assert.equal(scoreStep(find, { selected: [] }).credit, 0);
  // Duplicates do not count twice.
  assert.equal(scoreStep(find, { selected: ["minimumDue", "minimumDue"] }).credit, 0.5);
});

test("score number: exact, within tolerance, compute refs", () => {
  const n: NumberStep = { id: "n", type: "number", prompt: "p", explanation: "e", answer: { fn: "netPay", gross: 32000 } };
  assert.equal(scoreStep(n, { value: 30704 }).credit, 1);
  assert.equal(scoreStep(n, { value: "30,704" }).credit, 1);
  assert.equal(scoreStep(n, { value: 30700 }).credit, 0);
  const tol: NumberStep = { ...n, answer: 2500, tolerance: 100 };
  assert.equal(scoreStep(tol, { value: 2590 }).credit, 1); // within tolerance
  assert.equal(scoreStep(tol, { value: 2601 }).credit, 0);
  assert.equal(scoreStep(tol, { value: "abc" }).credit, 0);
  // No goal → cannot be scored for this student.
  const goal: NumberStep = { ...n, answer: { fn: "goalMonthly" } };
  assert.deepEqual(scoreStep(goal, { value: 1 }, {}), { credit: 1, scored: false, unresolved: true });
  assert.equal(scoreStep(goal, { value: 2500 }, { goal: { amount: 30000, months: 12 } }).credit, 1);
  assert.equal(parseNumberAnswer("NT$1,200"), 1200);
  assert.equal(parseNumberAnswer("1.2.3"), null);
});

const sort: SortStep = {
  id: "s",
  type: "sort",
  prompt: "p",
  explanation: "e",
  boxes: [
    { id: "keep", label: "留" },
    { id: "cut", label: "砍" },
    { id: "maybe", label: "看情況" },
  ],
  items: [
    { id: "rent", label: "房租", box: "keep" },
    { id: "gym", label: "健身房", box: "cut", accept: [{ option: "maybe", credit: 0.5 }] },
    { id: "phone", label: "手機", box: "keep", accept: ["maybe"] },
    { id: "free", label: "沒有標準" },
  ],
};

test("score sort: per item, accept full and partial, unboxed items not counted", () => {
  assert.equal(scoreStep(sort, { placements: { rent: "keep", gym: "cut", phone: "maybe" } }).credit, 1);
  const partial = scoreStep(sort, { placements: { rent: "keep", gym: "maybe", phone: "cut" } });
  near(partial.credit, 1.5 / 3);
  assert.equal(partial.perItem?.length, 3);
  assert.equal(scoreStep(sort, { placements: { rent: "cut", gym: "keep", phone: "nope" } }).credit, 0);
  assert.equal(scoreStep(sort, {}).credit, 0);
});

const order: OrderStep = {
  id: "o",
  type: "order",
  prompt: "p",
  explanation: "e",
  items: ["a", "b", "c", "d"].map((id) => ({ id, label: id })),
  answer: ["a", "b", "c", "d"],
};

test("score order: 1 − Kendall distance / max pairs", () => {
  assert.equal(scoreStep(order, { order: ["a", "b", "c", "d"] }).credit, 1);
  near(scoreStep(order, { order: ["b", "a", "c", "d"] }).credit, 1 - 1 / 6);
  near(scoreStep(order, { order: ["a", "c", "b", "d"] }).credit, 5 / 6);
  assert.equal(scoreStep(order, { order: ["d", "c", "b", "a"] }).credit, 0);
  // Not a permutation → 0.
  assert.equal(scoreStep(order, { order: ["a", "b", "c"] }).credit, 0);
  assert.equal(scoreStep(order, { order: ["a", "b", "c", "c"] }).credit, 0);
  assert.equal(scoreStep(order, { order: ["a", "b", "c", "d", "x"] }).credit, 0);
  assert.equal(kendallDistance(["c", "b", "a"], ["a", "b", "c"]), 3);
});

test("score reflection: unscored, credit 1, any answer", () => {
  const r = scoreStep({ ...choice, scored: false, correct: undefined }, { option: "zzz" });
  assert.deepEqual(r, { credit: 1, scored: false });
});

function task(steps: TaskSet["steps"], passScore = 0.6): TaskSet {
  return {
    id: "test.task.v1",
    kind: "test_task_v1",
    title: "t",
    brief: { from: { name: "n", role: "r", org: "o" }, message: "m", learn: "l", do: "d", minutes: 1 },
    materials: [],
    steps,
    passScore,
  };
}

test("scoreTask: totals, pass threshold, reflection-only passes", () => {
  const t = task([choice, find, { ...order, scored: false }]);
  const r = scoreTask(t, { c1: { option: "a" }, f: { selected: ["minimumDue"] }, o: { order: [] } });
  assert.equal(r.total, 2);
  near(r.score, 1.5);
  assert.equal(r.passed, true);
  assert.deepEqual(
    r.steps.map((s) => s.correct),
    [1, 0.5, 1],
  );
  const fail = scoreTask(t, { c1: { option: "c" }, f: { selected: ["minimumDue"] } });
  assert.equal(fail.passed, false);
  assert.equal(fail.steps[2].answer, null);
  // Exactly at the threshold passes (3 of 5 = 0.6).
  const five = task([choice, { ...choice, id: "c2" }, { ...choice, id: "c3" }, { ...choice, id: "c4" }, { ...choice, id: "c5" }]);
  const atPass = scoreTask(five, { c1: { option: "a" }, c2: { option: "a" }, c3: { option: "a" } });
  assert.equal(atPass.passed, true);
  // Reflection only.
  const refl = scoreTask(task([{ ...choice, scored: false }]), {});
  assert.equal(refl.total, 0);
  assert.equal(refl.passed, true);
  // Garbage answers never throw.
  assert.doesNotThrow(() => scoreTask(t, "garbage"));
  assert.doesNotThrow(() => scoreTask(t, { c1: 5, f: { selected: "x" }, o: null }));
});

// --- reveal ------------------------------------------------------------------------

test("pickReveal: byOutcome → byHookOption → default", () => {
  const reveal: BiasReveal = {
    bias: "錨定效應",
    byHookOption: { h1: "hook-1" },
    outcomeFrom: { stepId: "c1", map: { a: "good", b: "bad" } },
    byOutcome: { good: "outcome-good", bad: "outcome-bad" },
    default: "default",
  };
  assert.equal(pickReveal(reveal, "h1", { c1: { option: "a" } }), "outcome-good");
  assert.equal(pickReveal(reveal, "h1", { c1: { option: "b" } }), "outcome-bad");
  // Option with no mapped outcome → falls to the hook.
  assert.equal(pickReveal(reveal, "h1", { c1: { option: "c" } }), "hook-1");
  assert.equal(pickRevealWithSource(reveal, "h1", {}).source, "byHookOption");
  assert.equal(pickReveal(reveal, "h2", {}), "default");
  assert.equal(pickReveal(reveal, null, null), "default");
  assert.equal(pickReveal({ bias: "x", default: "d" }, "h1", { c1: { option: "a" } }), "d");
});

// --- draw --------------------------------------------------------------------------

test("draw: same key same items; a new attempt mostly differs", () => {
  const key = { taskSetId: "xinyong.bank.v1", studentId: "student-123", attempt: 1 };
  const a = drawIndices(18, 6, drawSeed(key, "rate"));
  const b = drawIndices(18, 6, drawSeed({ ...key }, "rate"));
  assert.deepEqual(a, b);
  assert.equal(a.length, 6);
  assert.equal(new Set(a).size, 6);
  assert.ok(a.every((i) => i >= 0 && i < 18));
  assert.deepEqual([...a].sort((x, y) => x - y), a); // content order

  let differs = 0;
  for (let attempt = 2; attempt <= 21; attempt++) {
    const c = drawIndices(18, 6, drawSeed({ ...key, attempt }, "rate"));
    if (c.join() !== a.join()) differs++;
  }
  assert.ok(differs >= 19, `only ${differs}/20 attempts drew a different set`);

  // Different students differ too, and every index gets drawn sometimes.
  const seen = new Set<number>();
  for (let s = 0; s < 200; s++) {
    for (const i of drawIndices(18, 6, drawSeed({ ...key, studentId: `s${s}` }, "rate"))) seen.add(i);
  }
  assert.equal(seen.size, 18);
  assert.deepEqual(drawIndices(4, undefined, 1), [0, 1, 2, 3]);
  assert.deepEqual(drawIndices(4, 9, 1), [0, 1, 2, 3]);
});

// --- validation --------------------------------------------------------------------

function line(overrides: Partial<LineContent> = {}): LineContent {
  return {
    slug: "xinyong",
    hook: { question: "q", options: [{ id: "h1", label: "a" }, { id: "h2", label: "b" }] },
    bias: "b",
    takeaway: { name: "t", lines: ["l"] },
    unlocks: "u",
    lessons: [
      {
        stationId: null,
        placement: "library",
        hook: { question: "q", options: [{ id: "h1", label: "a" }, { id: "h2", label: "b" }] },
        lessonCards: [{ kind: "text", title: "t", body: "短" }],
        task: {
          ...task([choice, find]),
          id: "xinyong.test.v1",
          kind: "xinyong_test_v1",
          materials: [
            {
              kind: "cardStatement",
              data: {
                bank: "b",
                month: "2026/10",
                closingDate: "10/15",
                dueDate: "10/30",
                limit: 20000,
                transactions: [],
                interest: 0,
              },
            },
          ],
        },
        reveal: { bias: "b", default: "d", byHookOption: { h1: "x" } },
        takeaway: { name: "t", lines: ["l"] },
        minutes: 15,
        lifeGameTurn: true,
      },
    ],
    ...overrides,
  };
}

test("validate: a clean line has no errors", () => {
  const errors = validateLine(line(), "x.ts", "xinyong").filter((i) => i.level === "error");
  assert.deepEqual(errors, []);
});

test("validate: catches the 03 §5.5 rules", () => {
  const bad = line();
  const lesson = bad.lessons[0];
  lesson.hook.options = [{ id: "h1", label: "a" }];
  lesson.lessonCards = [
    { kind: "text", title: "t", body: "字".repeat(81) },
    { kind: "text", title: "t", body: "a" },
    { kind: "text", title: "t", body: "a" },
    { kind: "text", title: "t", body: "a" },
  ];
  lesson.task.kind = "Bad-Kind";
  lesson.task.steps = [
    { ...choice, correct: "nope", explanation: "" },
    { ...find, targets: ["minimumDue", "notAField"], explainTargets: { minimumDue: "x" } },
    { ...sort, items: [{ id: "x", label: "x" }] },
  ];
  lesson.takeaway.lines = ["一句話——另一句"];
  bad.unlocks = "與虛構測試基金會合作";
  const messages = validateLine(bad, "x.ts", "xinyong", ["虛構測試基金會"])
    .filter((i) => i.level === "error")
    .map((i) => `${i.path}: ${i.message}`);
  const has = (re: RegExp) => assert.ok(messages.some((m) => re.test(m)), `missing ${re}\n${messages.join("\n")}`);
  has(/hook has 1 options/);
  has(/4 lesson cards/);
  has(/81 characters/);
  has(/kind "Bad-Kind"/);
  has(/correct "nope" is not an option id/);
  has(/scored step has no explanation/);
  has(/"notAField" does not exist/);
  has(/target "notAField" has no explanation/);
  has(/scored sort item has no box/);
  has(/em dash/);
  has(/contains a listed organisation name/);
  assert.equal(charLength("字".repeat(80)), 80);
});

test("validate: kinds unique across lines; NT$ figure is a warning", () => {
  const a = line();
  const b = line({ slug: "cunqian" });
  b.lessons[0].task.id = "cunqian.other.v1";
  const issues = validateAll([
    { file: "a.ts", content: a },
    { file: "b.ts", content: b },
  ]);
  assert.ok(issues.some((i) => i.level === "error" && /kind "xinyong_test_v1" is already used/.test(i.message)));

  const money = line();
  money.lessons[0].task.brief.message = "你這個月收到 NT$32,000。";
  const w = validateLine(money, "m.ts");
  assert.ok(w.some((i) => i.level === "warning" && /NT\$ figure/.test(i.message)));
  assert.ok(!w.some((i) => i.level === "error"));
  money.lessons[0].task.brief.message = "你這個月收到 NT$32,000（示意）。";
  assert.ok(!validateLine(money, "m.ts").some((i) => /NT\$ figure/.test(i.message)));
});

test("validate: zero content files is clean", () => {
  assert.deepEqual(validateAll([]), []);
});

import { profilePatchForTask } from "@/lib/tasks/profileWrites";
import { computeCreditCard } from "@/lib/sims/creditCard";

test("信用線 statement task writes creditRecord by the existing card rules", () => {
  assert.deepEqual(profilePatchForTask("xinyong_statement_v1", { s3: { option: "full" } }), { creditRecord: "good" });
  assert.deepEqual(profilePatchForTask("xinyong_statement_v1", { s3: { option: "min" } }), { creditRecord: "fair" });
  assert.deepEqual(profilePatchForTask("xinyong_statement_v1", { s3: { option: "partial" } }), { creditRecord: "fair" });
  assert.deepEqual(profilePatchForTask("xinyong_statement_v1", { s3: { option: "none" } }), { creditRecord: "poor" });
  assert.deepEqual(profilePatchForTask("xinyong_statement_v1", {}), {});
  // Same mapping as the old simulation's rules.
  assert.equal(computeCreditCard(["full", "full", "full"]).record, "good");
  assert.equal(computeCreditCard(["minimum", "full", "full"]).record, "fair");
  assert.equal(computeCreditCard(["missed", "full", "full"]).record, "poor");
});

import { containsDeniedName, DENY_HASHES, normaliseForDeny } from "@/lib/tasks/validate";
import { createHash } from "node:crypto";

test("deny list matches by hash: no listed name is written in the repo", () => {
  // The normalisation and hashing the list was built with.
  const h = (t: string) => createHash("sha256").update(normaliseForDeny(t)).digest("hex");
  assert.ok(DENY_HASHES.length >= 1);
  assert.equal(h("ＡＢＣ"), h("abc"), "full-width and case are folded");
  assert.equal(containsDeniedName("一般的理財課程內容"), false);
  assert.equal(containsDeniedName("和虛構測試基金會一起", ["虛構測試基金會"]), true);
});
