/**
 * Regression net for failures that have actually happened in this repo.
 *
 * Not broad coverage. Each test pins one bug that shipped, was found by
 * someone looking hard, and would otherwise be free to return. Runs with
 * Node's built-in runner through tsx — `npm test` — and imports only
 * modules that are safe outside Next (nothing that begins with
 * `import "server-only"`).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { computeSpending } from "@/lib/sims/spending";
import { outcomeTitleFor } from "@/lib/outcomeTitle";
import { readStoredResult, parseSimResult } from "@/lib/sims/types";
import {
  computeInvesting,
  INVEST_CHOICES,
  ETF_TAX_RATE,
  taxRateLabel,
} from "@/lib/sims/investing";
import { MODULES, getModule } from "@/lib/modules";
import { LINES } from "@/lib/lines";
import { requiredStations, homeFor } from "@/lib/modeModel";
import { buildLineStations } from "@/lib/buildStations";
import { computeBuyVsRent } from "@/lib/sims/buyVsRent";
import { computeStudentLoan } from "@/lib/sims/studentLoan";
import { SEED_ROWS, RAW_SEED_ROWS, SPLIT_ADJUSTMENTS } from "@/lib/historicalPricesSeed";
import { findDiscontinuities, reconcileSplits } from "@/lib/priceSeedGuard";
import type { SimulationRun } from "@/lib/types";

const run = (kind: string, outcome: unknown, extra: Partial<SimulationRun> = {}) =>
  ({ kind, outcome_summary: outcome, spending_choices: {}, savings_rate: null, ...extra }) as unknown as SimulationRun;

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}
const SOURCE_FILES = [...walk("app"), ...walk("components"), ...walk("lib")];

// ---------------------------------------------------------------------------
test("消費: a month that did not absorb the shortfall never stamps 剛剛好族", () => {
  const base = { housing: 20000, food: 8000, transport: 2000, phone: 800 };
  const short = computeSpending({
    income: 45000,
    incomeFromCareer: true,
    allocation: { ...base, social: 8000, shopping: 6200, savings: 0 },
  });
  assert.equal(short.absorbedShortfall, false);
  assert.equal(short.verdict, "short");
  assert.equal(outcomeTitleFor(run("xiaofei_needs_wants_v1", short))?.title, "月底族");

  // A row written under the old rule: verdict "tight" on a month that was short.
  const legacy = { ...short, verdict: "tight" };
  assert.equal(outcomeTitleFor(run("xiaofei_needs_wants_v1", legacy))?.title, "月底族");

  // And "tight" still exists for a month that absorbed it with nothing to spare.
  const onlyJust = computeSpending({
    income: 45000,
    incomeFromCareer: true,
    allocation: { ...base, social: 6700, shopping: 4000, savings: 3500 },
  });
  assert.equal(onlyJust.absorbedShortfall, true);
  assert.equal(onlyJust.verdict, "tight");
});

// ---------------------------------------------------------------------------
test("投資線: ETF 證交稅 is 0.1% everywhere it is computed or taught", () => {
  assert.equal(ETF_TAX_RATE, 0.001);
  for (const c of INVEST_CHOICES) {
    if (c.sellable) assert.equal(c.taxRate, ETF_TAX_RATE, `${c.id} carries the ETF rate`);
    else assert.equal(c.taxRate, 0, `${c.id} is not taxed`);
  }
  const o = computeInvesting({ choice: "buy0050", ipo: false, start: 100000 });
  assert.equal(o.chosen.taxOnMidSale, Math.round(o.chosen.mid * 0.001));
  assert.equal(taxRateLabel(o.chosen.taxRate), "0.1%");

  // The course's graded question about selling 0050 must mark the ETF rate correct.
  const m5 = getModule(5)!;
  const q = m5.quiz.find((x) => x.id === "m5q3")!;
  assert.match(q.options[q.answer], /0\.1%/);
  assert.doesNotMatch(q.options[q.answer], /0\.3%/);
});

// ---------------------------------------------------------------------------
test("mode: the toggle's own pick() is the only client writer to /api/mode", () => {
  const writers = SOURCE_FILES.filter((f) => !f.startsWith("app/api/")).filter((f) =>
    readFileSync(f, "utf8").includes('"/api/mode"'),
  );
  assert.deepEqual(writers, ["components/ModeToggle.tsx"]);
});

test("mode: no component links to /dashboard by name; home resolves through homeFor", () => {
  // Signed-out gates may still point at a fixed page; everything a signed-in
  // student clicks must go through homeFor / HomeLink.
  const allowed = new Set<string>([]);
  const offenders = SOURCE_FILES.filter((f) => f.startsWith("components/"))
    .filter((f) => !allowed.has(f))
    .filter((f) => /href=["']\/dashboard["']/.test(readFileSync(f, "utf8")));
  assert.deepEqual(offenders, []);
  assert.equal(homeFor("sim_first"), "/simulate");
  assert.equal(homeFor("full"), "/dashboard");
});

// ---------------------------------------------------------------------------
test("certificate: lists only the stations the mode requires, and ticks are conditional", () => {
  const zhapian = LINES.find((l) => l.slug === "zhapian")!;
  const core = requiredStations(zhapian, "sim_first").map((m) => m.number);
  const all = requiredStations(zhapian, "full").map((m) => m.number);
  assert.ok(core.length < all.length, "sim_first requires fewer stations");
  const src = readFileSync("app/line/[slug]/certificate/page.tsx", "utf8");
  assert.match(src, /requiredStations\(line, mode\)/);
  assert.match(src, /\{p && \(\s*<svg/);
});

test("route map: optional stations are flagged and never 'current'", () => {
  const zhapian = LINES.find((l) => l.slug === "zhapian")!;
  const st = buildLineStations(zhapian, [], null, "sim_first");
  const optional = st.filter((s) => s.required === false);
  assert.ok(optional.length > 0);
  assert.ok(optional.every((s) => s.status !== "current"));
});

// ---------------------------------------------------------------------------
test("stand-ins: capstone and 投資線 carry provenance into the stored outcome", () => {
  const cap = computeBuyVsRent({
    choice: "buy", income: 30000, savings: 50000, creditRecord: "fair",
    investedAmount: 0, hasInvested: false,
    incomeKnown: false, savingsKnown: false, creditKnown: false, investedKnown: false,
  });
  assert.equal(cap.incomeKnown, false);
  assert.equal(cap.savingsKnown, false);
  const parsed = parseSimResult({ kind: "capstone_buy_vs_rent_v1", outcome: cap });
  assert.ok(parsed.ok);
  if (parsed.ok && parsed.result.kind === "capstone_buy_vs_rent_v1") {
    assert.equal(parsed.result.outcome.savingsKnown, false);
  }

  const inv = computeInvesting({ choice: "buy0056", ipo: false, start: 50000, startFromSavingsLine: false });
  assert.equal(inv.startFromSavingsLine, false);
  const p2 = parseSimResult({ kind: "touzi_investing_v2", outcome: inv });
  assert.ok(p2.ok);
});

// ---------------------------------------------------------------------------
test("price seed: continuous, and every split adjustment reconciles with the raw data", () => {
  assert.deepEqual(findDiscontinuities(SEED_ROWS), []);
  assert.ok(findDiscontinuities(RAW_SEED_ROWS).length > 0, "the guard detects the raw split");
  for (const r of reconcileSplits(RAW_SEED_ROWS, SPLIT_ADJUSTMENTS)) assert.ok(r.ok, `${r.ticker} reconciles`);
});

// ---------------------------------------------------------------------------
test("學貸線: repayment accrues interest and is compared to the student's own income", () => {
  const a = computeStudentLoan({ school: "private", housing: "renting", loanCoversPct: 50, startingSalary: 30000, salaryFromCareer: false });
  assert.ok(a.totalInterest > 0);
  assert.ok(a.monthlyRepayment > Math.round(a.loanAmount / 120), "not zero-interest");
  const b = computeStudentLoan({ school: "private", housing: "renting", loanCoversPct: 50, startingSalary: 61000, salaryFromCareer: true });
  assert.equal(b.estimatedStartingSalary, 61000);
  assert.ok(b.repaymentAsPctOfSalary < a.repaymentAsPctOfSalary);
  assert.equal(b.salaryFromCareer, true);
});

// ---------------------------------------------------------------------------
test("legacy kinds: retired rows still parse and still stamp", () => {
  const cases: Array<[string, unknown, Partial<SimulationRun>, string]> = [
    ["xinyong_housing_v1", { chosen: { leftover: 4200 } }, { spending_choices: { housing: "roommates" } }, "合租族"],
    ["baoshui_tax_v1", { character: { id: "amei" } }, {}, "阿美的報稅員"],
    ["touzi_investing_v1", { start: 50000, chosen: { id: "buy0050", label: "買 0050", low: 41000, high: 64000, taxOnMidSale: 160 } }, {}, "風險承擔者"],
    ["qixin_salary_v1", { leftover: 5000, deficit: false, annualSavings: 60000 }, { savings_rate: 50 }, "規劃者"],
  ];
  for (const [kind, outcome, extra, title] of cases) {
    assert.ok(readStoredResult(kind, outcome), `${kind} parses`);
    assert.equal(outcomeTitleFor(run(kind, outcome, extra))?.title, title, `${kind} stamps`);
  }
});

// ---------------------------------------------------------------------------
test("modules: every core station belongs to a line and station 8 is core again", () => {
  const owned = new Set(LINES.flatMap((l) => l.stationModules));
  for (const m of MODULES) assert.ok(owned.has(m.number), `module ${m.number} is owned`);
  assert.equal(getModule(8)!.tier, "core");
});
