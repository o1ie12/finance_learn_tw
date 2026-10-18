/**
 * Onboarding (01 §6.3, 04 §1.3): the SMART check, the starter budget and
 * who still needs onboarding.
 *
 * Run: npx tsx --test tests/onboarding.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { BILLS, TRANSPORT } from "@/lib/lifeGame/constants";
import { netPay } from "@/lib/lifeGame/payroll";
import {
  ONBOARDING_VERSION,
  emergencyGoalAmount,
  monthlySaving,
  needsOnboarding,
  parseWholeNumber,
  skipAvatar,
  smartCheck,
  starterEssentials,
  starterMonthlyLeft,
  type GoalDraft,
  type SmartTickId,
} from "@/lib/onboarding";

const LEFT = 15_505;
const GOOD: GoalDraft = { name: "一台新筆電", amount: 30_000, months: 12, reason: "important" };

function tick(goal: GoalDraft, id: SmartTickId, left = LEFT) {
  const t = smartCheck(goal, left).ticks.find((x) => x.id === id);
  assert.ok(t, `tick ${id}`);
  return t;
}

// ---------- starter budget ----------

test("starter essentials come from the bill constants and sum to 04 §5's NT$15,199", () => {
  assert.equal(
    starterEssentials(),
    BILLS.familyContribution + BILLS.food + BILLS.phone + BILLS.daily + TRANSPORT.tpass,
  );
  assert.equal(starterEssentials(), 15_199);
  assert.equal(emergencyGoalAmount(), 3 * 15_199);
});

test("starterMonthlyLeft uses NT$32,000 until 職涯線 sets monthlyIncome", () => {
  assert.equal(starterMonthlyLeft({}), netPay(32_000) - 15_199);
  assert.equal(starterMonthlyLeft({}), LEFT);
  assert.equal(starterMonthlyLeft({ monthlyIncome: 40_000 }), netPay(40_000) - 15_199);
});

// ---------- the five ticks ----------

test("a full SMART goal meets all five ticks and has no hints", () => {
  const r = smartCheck(GOOD, LEFT);
  assert.equal(r.allMet, true);
  assert.deepEqual(
    r.ticks.map((t) => t.id),
    ["specific", "measurable", "achievable", "relevant", "timebound"],
  );
  assert.deepEqual(
    r.ticks.map((t) => t.label),
    ["具體", "可衡量", "做得到", "相關", "有期限"],
  );
  for (const t of r.ticks) assert.equal(t.hint, "");
  assert.equal(r.monthly, 2_500);
});

test("具體: a blank or whitespace name is not specific", () => {
  assert.equal(tick({ ...GOOD, name: "" }, "specific").met, false);
  assert.equal(tick({ ...GOOD, name: "   " }, "specific").hint, "要存錢買什麼？寫清楚一點。");
  assert.equal(tick({ ...GOOD, name: "機車" }, "specific").met, true);
  assert.equal(tick({ ...GOOD, name: "<b>" }, "specific").met, false);
  assert.equal(tick({ ...GOOD, name: "一".repeat(21) }, "specific").met, false);
});

test("可衡量: the amount must be a whole number above 0", () => {
  assert.equal(tick({ ...GOOD, amount: null }, "measurable").met, false);
  assert.equal(tick({ ...GOOD, amount: 0 }, "measurable").met, false);
  assert.equal(tick({ ...GOOD, amount: -100 }, "measurable").met, false);
  assert.equal(tick({ ...GOOD, amount: 99.5 }, "measurable").met, false);
  assert.equal(tick({ ...GOOD, amount: 0 }, "measurable").hint, "目標要有金額，才知道離終點多遠。");
  assert.equal(tick({ ...GOOD, amount: 1 }, "measurable").met, true);
});

test("相關: 別人都有 does not tick it; the other three reasons do", () => {
  const others = tick({ ...GOOD, reason: "others" }, "relevant");
  assert.equal(others.met, false);
  assert.equal(others.hint, "別人有，不一定代表你需要。這個目標對你重要嗎？");
  assert.equal(smartCheck({ ...GOOD, reason: "others" }, LEFT).allMet, false);
  for (const reason of ["important", "safety", "future"]) {
    assert.equal(tick({ ...GOOD, reason }, "relevant").met, true, reason);
  }
  assert.equal(tick({ ...GOOD, reason: null }, "relevant").met, false);
  assert.equal(tick({ ...GOOD, reason: "made-up" }, "relevant").met, false);
});

test("有期限: 1 to 60 whole months", () => {
  for (const months of [1, 30, 60]) assert.equal(tick({ ...GOOD, amount: 600, months }, "timebound").met, true);
  for (const months of [0, 61, -1, 1.5, null]) {
    assert.equal(tick({ ...GOOD, months }, "timebound").met, false, String(months));
  }
  assert.equal(tick({ ...GOOD, months: null }, "timebound").hint, "給自己一個期限。");
});

test("做得到: amount ÷ months at the limit is reachable, one dollar over is not", () => {
  // 12 × 15,505 = 186,060: exactly the monthly money left.
  assert.equal(tick({ ...GOOD, amount: 186_060, months: 12 }, "achievable").met, true);
  const over = tick({ ...GOOD, amount: 186_061, months: 12 }, "achievable");
  assert.equal(over.met, false);
  // The hint names the rounded-up monthly amount, plainly.
  assert.equal(over.hint, "每個月要存 NT$15,600，超過你目前能存的。試試拉長時間或降低金額。");
  // Stretching the time makes it reachable again.
  assert.equal(tick({ ...GOOD, amount: 186_061, months: 13 }, "achievable").met, true);
});

test("做得到 needs both the amount and the months, and uses the student's own budget", () => {
  assert.equal(tick({ ...GOOD, months: null }, "achievable").met, false);
  assert.equal(tick({ ...GOOD, amount: null }, "achievable").met, false);
  assert.equal(tick(GOOD, "achievable", 2_000).met, false);
  assert.equal(tick(GOOD, "achievable", 2_500).met, true);
  assert.equal(tick(GOOD, "achievable", 0).met, false);
});

// ---------- the monthly line ----------

test("每個月要存 rounds up to the next NT$100", () => {
  assert.equal(monthlySaving(30_000, 12), 2_500);
  assert.equal(monthlySaving(20_000, 10), 2_000);
  assert.equal(monthlySaving(45_000, 18), 2_500);
  assert.equal(monthlySaving(12_000, 7), 1_800); // 1,714.28 → 1,800
  assert.equal(monthlySaving(1, 60), 100);
  assert.equal(monthlySaving(45_597, 12), 3_800); // 3,799.75 → 3,800
  assert.equal(smartCheck({ ...GOOD, amount: 10_001, months: 10 }, LEFT).monthly, 1_100);
  assert.equal(smartCheck({ ...GOOD, months: 0 }, LEFT).monthly, null);
});

test("parseWholeNumber accepts digits and thousands commas only", () => {
  assert.equal(parseWholeNumber("30,000"), 30_000);
  assert.equal(parseWholeNumber(" 12 "), 12);
  assert.equal(parseWholeNumber(""), null);
  assert.equal(parseWholeNumber("1.5"), null);
  assert.equal(parseWholeNumber("-3"), null);
  assert.equal(parseWholeNumber("abc"), null);
});

// ---------- who needs onboarding ----------

test("needsOnboarding: missing or older version → true; current or newer → false", () => {
  assert.equal(needsOnboarding({ profile: {} }), true);
  assert.equal(needsOnboarding({ profile: null }), true);
  assert.equal(needsOnboarding({ profile: { onboardedVersion: ONBOARDING_VERSION - 1 } }), true);
  assert.equal(needsOnboarding({ profile: { onboardedVersion: ONBOARDING_VERSION } }), false);
  assert.equal(needsOnboarding({ profile: { onboardedVersion: ONBOARDING_VERSION + 1 } }), false);
  // A malformed profile reads as empty, so the student sees onboarding.
  assert.equal(needsOnboarding({ profile: { onboardedVersion: "1" } }), true);
  assert.equal(needsOnboarding(null), false);
});

test("skipAvatar names the default character after the student, at most 8 characters", () => {
  assert.equal(skipAvatar("王小明").name, "王小明");
  assert.equal(skipAvatar("一二三四五六七八九十").name, "一二三四五六七八");
  assert.equal(skipAvatar("A").name, "小宇"); // too short for an avatar name
});
