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
import {
  PRE_POST_QUESTIONS,
  PRE_POST_BANK_VERSION,
  comparablePrePost,
  bankVersionOf,
} from "@/lib/prePostQuestions";
import { LINES } from "@/lib/lines";
import { BRANCHES, branchesForLine, findBranchById } from "@/lib/branches";
import { requiredStations, homeFor } from "@/lib/modeModel";
import { buildLineStations } from "@/lib/buildStations";
import { computeBuyVsRent } from "@/lib/sims/buyVsRent";
import { computeStudentLoan } from "@/lib/sims/studentLoan";
import { computeCreditCard } from "@/lib/sims/creditCard";
import { TIME_DEPOSIT_1Y } from "@/lib/rates";
import { SAVINGS_STORAGE } from "@/lib/sims/savings";
import {
  TAX_YEAR,
  TAX_CHARACTERS,
  payslipFor,
  computeTaxFiling,
} from "@/lib/sims/taxFiling";
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
// The test above pins the CODE. The copy students read came back wrong twice
// anyway (the 投資線 card and the home card both said 0.3% for an ETF-only
// simulation), because nothing read the words. This one reads them.
test("投資線 copy: 0.3% is only ever the stock rate, never the ETF rate", () => {
  const files = [...SOURCE_FILES, "README.md"];
  const offenders: string[] = [];
  for (const f of files) {
    const lines = readFileSync(f, "utf8").split("\n");
    lines.forEach((line, i) => {
        if (!/0\.3\s?%/.test(line)) return;
        const where = `${f}:${i + 1}`;
        // Every 0.3% must say it is the STOCK rate.
        if (!/股票|stock/i.test(line)) offenders.push(`${where} — 0.3% without 股票`);
        // A line that names an ETF next to 0.3% must state the ETF rate within
        // the same sentence. JSX wraps sentences, so the neighbouring lines count.
        const near = lines.slice(Math.max(0, i - 1), i + 2).join(" ");
        if (/ETF|0050|0056/.test(line) && !/0\.1\s?%|taxRateLabel\(/.test(near))
          offenders.push(`${where} — ETF named beside 0.3% without the 0.1% ETF rate`);
    });
  }
  assert.deepEqual(offenders, [], offenders.join("\n"));

  // The two surfaces that regressed, checked directly.
  const touzi = LINES.find((l) => l.slug === "touzi")!;
  assert.match(touzi.sim.covers, /0\.1%/, "投資線 card states the ETF rate");
  const home = readFileSync("app/page.tsx", "utf8");
  const homeTax = home.split("\n").filter((l) => l.includes("證交稅"));
  assert.ok(homeTax.length > 0);
  for (const l of homeTax) assert.match(l, /ETF 0\.1%/, "home card states the ETF rate");
});

// ---------------------------------------------------------------------------
// m10q2 shipped an author's note to students: 「細節建議請教專業法律意見後定稿」.
test("content: no author's notes in anything a student reads", () => {
  const banks = [
    ...MODULES.flatMap((m) => m.quiz.flatMap((q) => [q.q, q.explain, ...q.options])),
  ];
  const note = /定稿|待確認後|請教專業法律意見|TODO|FIXME/;
  for (const t of banks) assert.doesNotMatch(t, note, t);
  for (const f of walk("components/lessons")) {
    assert.doesNotMatch(readFileSync(f, "utf8"), note, f);
  }
});

// ---------------------------------------------------------------------------
// line_tests stores only score/total. 消費線 replaced its whole bank, and
// production already holds attempts out of 6 next to attempts out of 10 for
// one line. A pre and a post are comparable only on the same bank.
test("前後測: scores are never compared across bank versions", () => {
  for (const slug of Object.keys(PRE_POST_QUESTIONS))
    assert.ok(
      (PRE_POST_BANK_VERSION as Record<string, number>)[slug] >= 1,
      `${slug} has a bank version`,
    );

  // 消費線's bank was the retired 起薪線's (勞退, 加班費, 試用期…) and tested
  // nothing the line teaches. Replaced as version 2.
  assert.ok(PRE_POST_BANK_VERSION.qixin >= 2, "消費線's replaced bank is version 2 or later");
  assert.ok(PRE_POST_BANK_VERSION.xinyong >= 2, "信用線: pp-xinyong-4's answer changed");
  const qixin = PRE_POST_QUESTIONS.qixin;
  assert.equal(qixin.length, 10);
  for (const q of qixin) {
    const text = [q.q, q.explain, ...q.options].join(" ");
    assert.doesNotMatch(text, /勞退|加班費|試用期|扣繳憑單|勞保|健保|期望薪資/, q.id);
  }

  // Rows from before migration-19 carry no version and are version 1.
  assert.equal(bankVersionOf({}), 1);
  assert.equal(bankVersionOf({ bank_version: null }), 1);

  const v1 = { bank_version: 1, total: 10 };
  const v2 = { bank_version: 2, total: 10 };
  assert.equal(comparablePrePost(v1, v1), true);
  assert.equal(comparablePrePost(v1, v2), false, "different versions");
  assert.equal(
    comparablePrePost({ total: 6 }, { bank_version: 1, total: 10 }),
    false,
    "same version label, different bank size",
  );
});

// ---------------------------------------------------------------------------
// 180 of 211 graded questions had the second option correct (and all 14
// MicroChecks did). Once a student notices, every score is meaningless.
test("quizzes: the correct answer's position carries no information", () => {
  const banks: { name: string; answers: number[]; sizes: number[] }[] = [
    ...MODULES.map((m) => ({
      name: `m${m.number}`,
      answers: m.quiz.map((q) => q.answer),
      sizes: m.quiz.map((q) => q.options.length),
    })),
    ...Object.entries(PRE_POST_QUESTIONS).map(([slug, qs]) => ({
      name: `pp-${slug}`,
      answers: qs.map((q) => q.answer),
      sizes: qs.map((q) => q.options.length),
    })),
  ];
  const all = banks.flatMap((b) => b.answers);
  const counts = [0, 1, 2, 3].map((p) => all.filter((a) => a === p).length);
  // Every position used, between a fifth and a third of all questions.
  for (const c of counts)
    assert.ok(c / all.length >= 0.2 && c / all.length < 1 / 3, `positions ${counts}`);
  for (const b of banks) {
    b.answers.forEach((a, i) => assert.ok(a >= 0 && a < b.sizes[i], `${b.name} q${i}`));
    // No three consecutive questions in one bank share an answer position.
    for (let i = 2; i < b.answers.length; i++)
      assert.ok(
        !(b.answers[i] === b.answers[i - 1] && b.answers[i] === b.answers[i - 2]),
        `${b.name} has three in a row at ${i}`,
      );
  }

  // MicroChecks live in lesson bodies.
  const micro = walk("components/lessons").flatMap((f) =>
    [...readFileSync(f, "utf8").matchAll(/correctIndex=\{(\d+)\}/g)].map((m) => Number(m[1])),
  );
  assert.ok(micro.length > 0);
  assert.ok(new Set(micro).size >= 3, `MicroCheck positions ${micro}`);
});

// ---------------------------------------------------------------------------
// The correct option was the single longest in 136 of 180 four-option
// questions (2026-10), so "pick the longest" scored about 75%.
test("quizzes: the correct option is rarely the longest", () => {
  const four = [...MODULES.flatMap((m) => m.quiz), ...Object.values(PRE_POST_QUESTIONS).flat()].filter(
    (q) => q.options.length === 4,
  );
  const longest = four.filter((q) => {
    const lens = q.options.map((o) => o.length);
    const max = Math.max(...lens);
    return lens[q.answer] === max && lens.filter((l) => l === max).length === 1;
  });
  assert.ok(four.length > 100);
  assert.ok(
    longest.length / four.length <= 0.35,
    `correct option is longest in ${longest.length}/${four.length}`,
  );
});

// ---------------------------------------------------------------------------
// 財務決策線's bank has 3 questions; the line page told students 「10 題」.
test("前後測 copy: never hard-codes how many questions a bank has", () => {
  for (const f of ["app/line/[slug]/page.tsx", "components/PrePostTest.tsx", "app/class/host/page.tsx"])
    assert.doesNotMatch(readFileSync(f, "utf8"), /\d+\s*題(前測|後測|前後測|，)/, f);
});

// ---------------------------------------------------------------------------
// 報稅線 labelled the same figures 113年度 on station 20 and 114年度 in the
// simulation, and an earlier set mixed years outright. One object, one year.
test("報稅線: 115年度 figures, one source, station and simulation agree", () => {
  assert.equal(TAX_YEAR.year, 115);
  assert.equal(TAX_YEAR.filedIn, 2027);
  assert.equal(TAX_YEAR.personalExemption, 101000);
  assert.equal(TAX_YEAR.standardDeduction, 136000);
  assert.equal(TAX_YEAR.salaryDeductionCap, 227000);
  assert.deepEqual(
    TAX_YEAR.brackets.map((b) => [b.upTo, b.rate, b.offset]),
    [
      [610000, 0.05, 0],
      [1380000, 0.12, 42700],
      [2770000, 0.2, 153100],
      [5190000, 0.3, 430100],
      [Infinity, 0.4, 949100],
    ],
  );
  // The 速算 offsets must give the same tax either side of every boundary.
  const bs = TAX_YEAR.brackets;
  for (let i = 0; i < bs.length - 1; i++) {
    const x = bs[i].upTo;
    assert.equal(
      Math.round(x * bs[i].rate - bs[i].offset),
      Math.round(x * bs[i + 1].rate - bs[i + 1].offset),
      `continuous at ${x}`,
    );
  }

  // Hand-checked: 1,200,000 − 101,000 − 136,000 − 227,000 = 736,000 (12%).
  const hao = TAX_CHARACTERS.find((c) => c.id === "hao")!;
  const r = computeTaxFiling({
    characterId: "hao",
    payslipGuess: payslipFor(hao).takeHome,
    deductionIds: ["exemption", "standard", "salary"],
    method: "flat_top",
  })!;
  assert.equal(r.netIncome, 736000);
  assert.equal(r.taxOwed, 45620); // 736,000 × 12% − 42,700
  assert.equal(r.studentTax, 88320); // the misconception, visibly wrong

  // 2026 payroll: 勞保 employee 12.5% × 20% on salary capped at 45,800.
  assert.equal(payslipFor(hao).laborInsurance, Math.round(45800 * 0.025));

  // Station 20 reads the year from the same object; no year typed by hand.
  const m20 = readFileSync("components/lessons/Module20.tsx", "utf8");
  assert.match(m20, /TAX_YEAR/);
  assert.doesNotMatch(m20, /11[0-9]\s*年度/);
});

// ---------------------------------------------------------------------------
// Station 7 taught that 循環利息 starts 「從消費當天」 while the simulation
// only charged interest on the carried balance from the next statement. Both
// now follow the rule banks publish: the UNPAID part of each charge accrues
// daily from its 入帳日, billed on the next statement, no interest on
// interest, none if what remains is under NT$1,000.
test("信用線: revolving interest runs from each charge's 入帳日, by hand", () => {
  // All-minimum, charges 8,000 / 3,500 / 5,000; 30-day cycles; each charge
  // posts 15 days before its statement; 15% ÷ 365 per day.
  //  R1: owe 8,000, pay 800 → 7,200 unpaid; no interest on a first bill.
  //  R2: 7,200 × 45 days × 15%/365 = 133. Owe 10,833, pay 1,100 (interest
  //      first) → older principal 6,233, new 3,500.
  //  R3: (6,233 × 30 + 3,500 × 45) × 15%/365 = 142.
  const all = computeCreditCard(["minimum", "minimum", "minimum"]);
  assert.deepEqual(all.rounds.map((r) => r.interestAccrued), [0, 133, 142]);
  assert.equal(all.totalInterest, 275);
  assert.deepEqual(all.rounds.map((r) => r.minimumPayment), [800, 1100, 1500]);

  // Paying in full by the due date costs nothing, whatever came before.
  assert.equal(computeCreditCard(["full", "full", "full"]).totalInterest, 0);
  assert.equal(computeCreditCard(["minimum", "full", "full"]).totalInterest, 133);

  // Station 7's graded question teaches the same rule the simulation runs.
  const m7 = getModule(7)!.quiz.find((q) => q.id === "m7q1")!;
  assert.match(m7.options[m7.answer], /入帳日/);
  assert.doesNotMatch(m7.options[m7.answer] + m7.explain, /消費當天/);
});

// ---------------------------------------------------------------------------
// 消費線 carried two 起薪線 branches (加班費, 資遣費) about nothing it teaches.
test("branches: the 起薪 branches live on 職涯線 and their old URLs resolve", () => {
  assert.deepEqual(branchesForLine("zhiya").map((b) => b.id).sort(), ["jiaban", "zizhi"]);
  assert.equal(branchesForLine("qixin").length, 0);
  // Ids are unique across lines, which is what makes redirect-by-id safe.
  assert.equal(new Set(BRANCHES.map((b) => b.id)).size, BRANCHES.length);
  assert.equal(findBranchById("jiaban")?.lineSlug, "zhiya");
});

// ---------------------------------------------------------------------------
// Station 3 said 定存 was 「大約 1.5%」 while both simulations used 1.6%.
test("定存: one rate, defined once, used by station and both simulations", () => {
  const td = SAVINGS_STORAGE.find((s) => s.id === "timeDeposit")!;
  assert.equal(td.annualRate, TIME_DEPOSIT_1Y.rate);
  const savings = INVEST_CHOICES.find((c) => c.id === "savings")!;
  assert.equal(savings.mid, 1 + TIME_DEPOSIT_1Y.rate);
  const m3 = readFileSync("components/lessons/Module3.tsx", "utf8");
  assert.match(m3, /TIME_DEPOSIT_1Y/);
  assert.doesNotMatch(m3, /1\.5% 上下|郵局更低/);
});

// The 詐騙線 shipped two figures no government source supports (a 900億
// loss total, 網購 as the most common type) and one that was wrong.
test("詐騙線: statistics come from the 警政署 bulletin, not unsourced figures", () => {
  const text = [
    ...[9, 11].flatMap((n) => getModule(n)!.quiz.flatMap((q) => [q.q, q.explain, ...q.options])),
    ...PRE_POST_QUESTIONS.zhapian.flatMap((q) => [q.q, q.explain, ...q.options]),
    readFileSync("components/lessons/Module9.tsx", "utf8"),
    readFileSync("components/lessons/Module11.tsx", "utf8"),
  ].join("\n");
  assert.doesNotMatch(text, /900 ?億|受理案件數最多|財損金額最高/);
  assert.equal(PRE_POST_BANK_VERSION.zhapian, 2);
});

// ---------------------------------------------------------------------------
// In 模擬 mode a core station is shown only as its tip; without one, the
// subtitle (a headline) stood in. Only 1 of 28 core stations had a tip.
test("sim-first: every core station has a real tip grounded in its station", () => {
  for (const m of MODULES.filter((x) => x.tier === "core")) {
    assert.ok(m.tip, `station ${m.number} ${m.station} has a tip`);
    const tip = m.tip!;
    assert.notEqual(tip.trim(), m.subtitle.trim(), `${m.station}: tip is not the subtitle`);
    assert.ok(tip.length >= 20 && tip.length <= 120, `${m.station}: tip length ${tip.length}`);
    // A tip may not introduce a figure its station doesn't teach.
    const body = readFileSync(`components/lessons/Module${m.number}.tsx`, "utf8");
    for (const n of tip.match(/\d+(?:\.\d+)?/g) ?? [])
      assert.ok(body.includes(n), `${m.station}: tip figure ${n} appears in the station`);
  }
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
test("mode: progress counts match what completion requires, not the full station list", () => {
  // The bug: the dashboard's 站完成 counter and the map's per-line chips
  // counted every station, so a sim_first student who had genuinely finished
  // their line was told 28/41 and 3/6 — the platform reporting failure to
  // someone who had succeeded.
  const requiredAll = LINES.flatMap((l) => requiredStations(l, "sim_first").map((m) => m.number));
  const everyStation = LINES.flatMap((l) => l.stationModules);
  assert.ok(requiredAll.length < everyStation.length, "sim_first requires fewer than every station");

  // A student who has completed exactly the required set reads 100%, both in
  // the dashboard's aggregate and in a single line's counters.
  const doneSet = new Set(requiredAll);
  assert.equal(requiredAll.filter((n) => doneSet.has(n)).length, requiredAll.length);

  const line = LINES.find((l) => l.slug === "zhapian")!;
  const progress = requiredStations(line, "sim_first").map((m) => ({
    module_number: m.number,
    completed_at: "2026-01-01",
  }));
  const stations = buildLineStations(line, progress as never, null, "sim_first");
  const counted = stations.filter((s) => s.required !== false && !s.terminal);
  assert.ok(counted.length > 0);
  assert.equal(
    counted.filter((s) => s.status === "done").length,
    counted.length,
    "every counted station reads done",
  );
  // And the optional ones are still on the map, just not in the denominator.
  assert.ok(stations.some((s) => s.required === false));
});

// ---------------------------------------------------------------------------
test("a11y: the focus ring and the tour's Tab trap are still in place", () => {
  // Both are easy to delete without anything failing: the ring is one CSS
  // rule, and without it a keyboard user choosing any simulation option sees
  // nothing at all, because SelectCard's radio is clipped to 1px.
  const css = readFileSync("app/globals.css", "utf8");
  assert.match(css, /label:has\(>\s*input\.sr-only:focus-visible\)/);

  // The tour is portaled over a dimmed page; without the trap, Tab walks
  // into content the student cannot see and never reaches the tour's own
  // controls.
  const overlay = readFileSync("components/tour/TourOverlay.tsx", "utf8");
  assert.match(overlay, /e\.key !== "Tab"/);
  assert.match(overlay, /shiftKey/);
  assert.match(overlay, /opener\.focus/);
});

// ---------------------------------------------------------------------------
test("modules: every core station belongs to a line and station 8 is core again", () => {
  const owned = new Set(LINES.flatMap((l) => l.stationModules));
  for (const m of MODULES) assert.ok(owned.has(m.number), `module ${m.number} is owned`);
  assert.equal(getModule(8)!.tier, "core");
});

// ---------------------------------------------------------------------------
// P2 2a: 投資線 charges 手續費 on both sides of the trade, next to 證交稅, and
// stores it as touzi_investing_v3. v2 rows (no fees) must still read as v2.
test("投資線: 手續費 on buy and sale, one total, and old v2 rows still parse", () => {
  const o = computeInvesting({ choice: "buy0050", start: 100000 });
  assert.equal(o.chosen.buyFee, Math.round(100000 * 0.001425));
  assert.equal(o.chosen.sellFeeOnMid, Math.round(o.chosen.mid * 0.001425));
  assert.equal(
    o.chosen.totalCostOnMid,
    o.chosen.buyFee + o.chosen.sellFeeOnMid + o.chosen.taxOnMidSale,
  );
  const saved = computeInvesting({ choice: "savings", start: 100000 });
  assert.equal(saved.chosen.totalCostOnMid, 0, "定存 is not traded");

  assert.ok(parseSimResult({ kind: "touzi_investing_v3", outcome: o }).ok);
  const v2Chosen: Record<string, unknown> = { ...o.chosen };
  for (const k of ["buyFee", "sellFeeOnMid", "totalCostOnMid"]) delete v2Chosen[k];
  const v2Row = { ...o, chosen: v2Chosen };
  assert.ok(parseSimResult({ kind: "touzi_investing_v2", outcome: v2Row }).ok, "v2 row parses as v2");
  assert.equal(parseSimResult({ kind: "touzi_investing_v3", outcome: v2Row }).ok, false);
});

// ---------------------------------------------------------------------------
// P2 2b: the 儲蓄險 pitch has numbers, the IRR comes from the policy's own
// cash flows, the comparison is the verified 定存 rate, the decision is judged,
// and 都不買 is still a complete ending.
test("保險線: 儲蓄險 IRR vs 定存, decision evaluated, 都不買 valid", async () => {
  const { computeSalesPitch, surrenderIrr, SAVINGS_POLICY } = await import("@/lib/sims/salesPitch");
  const { TIME_DEPOSIT_1Y } = await import("@/lib/rates");
  // IRR is real: at year 6 the policy returns less than was paid in.
  assert.ok(SAVINGS_POLICY.surrenderValues[5] < SAVINGS_POLICY.annualPremium * 6);
  assert.ok(surrenderIrr(6) < 0);
  assert.ok(surrenderIrr(10) < SAVINGS_POLICY.declaredRate, "宣告利率 is not what you earn");
  const none = computeSalesPitch({ decisions: { savings: "decline", accident: "decline", reimbursement: "decline" } });
  assert.equal(none.allDeclined, true);
  assert.equal(none.savingsVerdict, "declined");
  assert.equal(none.depositRate, TIME_DEPOSIT_1Y.rate);
  const blind = computeSalesPitch({ decisions: { savings: "buy", accident: "decline", reimbursement: "decline" } });
  assert.equal(blind.savingsVerdict, "bought_without_checking");
  const checked = computeSalesPitch({ decisions: { savings: "buy", accident: "buy", reimbursement: "decline" }, askedForTable: true });
  assert.equal(checked.savingsVerdict, "bought_after_checking");
  assert.ok(parseSimResult({ kind: "baoxian_sales_pitch_v2", outcome: checked }).ok);
  assert.ok(parseSimResult({ kind: "baoxian_sales_pitch_v1", outcome: { allDeclined: true, boughtSavings: false } }).ok);
});

// ---------------------------------------------------------------------------
// P2 2c: 詐騙線 promises consequences for wrong answers. Every scam card says
// what actually happens if believed; 假檢警 and "they know my order" exist.
test("詐騙線: every scam card has a consequence; 假檢警 and order-detail cards", async () => {
  const { FRAUD_CARDS, AFTER_SCAM_STEPS, computeFraud } = await import("@/lib/sims/fraud");
  for (const c of FRAUD_CARDS) {
    if (c.isScam) assert.ok(c.consequence && c.consequence.length > 15, `${c.id} has a consequence`);
    else assert.equal(c.consequence, undefined, `${c.id} is real and has none`);
  }
  assert.ok(FRAUD_CARDS.some((c) => /檢察官|監管帳戶/.test(c.text)));
  assert.ok(FRAUD_CARDS.some((c) => /訂單編號/.test(c.text)));
  assert.equal(AFTER_SCAM_STEPS.length, 3);
  assert.ok(AFTER_SCAM_STEPS.some((s) => s.includes("165")));
  const o = computeFraud({});
  assert.ok(parseSimResult({ kind: "zhapian_fraud_v2", outcome: o }).ok);
  assert.ok(parseSimResult({ kind: "zhapian_fraud_v1", outcome: { correct: 15, total: 20 } }).ok);
});

// ---------------------------------------------------------------------------
// P2 2d: 學貸 follows the 115學年度 rules — nothing paid in school, nothing in
// a 2-year grace period, then repayment at 0.775%.
test("學貸線: in school and grace cost the student nothing; repayment at 0.775%", async () => {
  const { computeStudentLoan, LOAN_ANNUAL_RATE, GRACE_YEARS } = await import("@/lib/sims/studentLoan");
  assert.equal(LOAN_ANNUAL_RATE, 0.00775);
  assert.equal(GRACE_YEARS, 2);
  const o = computeStudentLoan({ school: "private", housing: "renting", loanCoversPct: 100, startingSalary: 35000, salaryFromCareer: false });
  const [school, grace, repay] = o.phases;
  assert.deepEqual([school.id, grace.id, repay.id], ["school", "grace", "repay"]);
  assert.equal(school.total + grace.total, 0);
  assert.equal(repay.monthly, o.monthlyRepayment);
  assert.equal(repay.total - o.loanAmount, o.totalInterest);
  assert.ok(o.totalInterest > 0);
  assert.ok(parseSimResult({ kind: "xuedai_student_loan_v2", outcome: o }).ok);
  assert.ok(parseSimResult({ kind: "xuedai_student_loan_v1", outcome: { loanCoversPct: 50 } }).ok);
});

// ---------------------------------------------------------------------------
// P2 2e: interest is only earned on money that is there, so it is never
// negative and needs no floor; the result projects the student's own deposit
// and rate to 10 years.
test("存錢線: interest never negative without a floor; 10-year line uses the student's rate", async () => {
  const { computeSavings } = await import("@/lib/sims/savings");
  const { DEMAND_SAVINGS } = await import("@/lib/rates");
  // Deposit 0 and give in to everything: the balance goes below zero.
  const broke = computeSavings({ goalId: "concert", storageId: "timeDeposit", months: 12, monthlyDeposit: 0, temptationResponses: [true, true, true] });
  assert.equal(broke.user.interest, 0);
  const o = computeSavings({ goalId: "laptop", storageId: "bank", months: 18, monthlyDeposit: 1500, temptationResponses: [false, false, false] });
  assert.equal(o.storage.annualRate, DEMAND_SAVINGS.rate);
  assert.equal(o.tenYear.deposited, 1500 * 120);
  assert.ok(o.tenYear.interest > o.resistAll.interest);
  assert.equal(o.tenYear.finalAmount, o.tenYear.deposited + o.tenYear.interest);
  assert.ok(parseSimResult({ kind: "cunqian_savings_v2", outcome: o }).ok);
});

// ---------------------------------------------------------------------------
// P2 2f: 毛利率 shown, stock-outs counted instead of vanishing, and the day-12
// price decision changes the result.
test("創業線: 毛利率, stock-outs and the day-12 decision", async () => {
  const { computeBubbleTea, COST_SHOCK_DAY, PRICE_RAISE } = await import("@/lib/sims/bubbleTea");
  const keep = computeBubbleTea({ priceId: "low", prepId: "small", raiseAfterShock: false });
  assert.equal(keep.grossMarginPct, 60); // (30 − 12) ÷ 30
  // low price wants 70 cups/day; a 40-cup stall turns customers away.
  assert.ok(keep.lostCupsTotal > 0);
  assert.equal(keep.days[0].lostCups, keep.days[0].demand - keep.days[0].cupsSold);
  const raise = computeBubbleTea({ priceId: "mid", prepId: "medium", raiseAfterShock: true });
  const hold = computeBubbleTea({ priceId: "mid", prepId: "medium", raiseAfterShock: false });
  assert.equal(raise.days[COST_SHOCK_DAY - 1].pricePerCup, 45 + PRICE_RAISE);
  assert.equal(hold.days[COST_SHOCK_DAY - 1].pricePerCup, 45);
  assert.equal(raise.days[COST_SHOCK_DAY - 2].pricePerCup, 45, "nothing changes before day 12");
  assert.notEqual(raise.finalCash, hold.finalCash);
  assert.ok(parseSimResult({ kind: "chuangye_bubble_tea_v2", outcome: raise }).ok);
  assert.ok(parseSimResult({ kind: "chuangye_bubble_tea_v1", outcome: { survived: true, priceId: "mid" } }).ok);
});

// ---------------------------------------------------------------------------
// P2 2g: savingsBehavior used to sit on the recap and feed nothing. It now
// sets how many years the missing deposit takes.
test("財務決策線: 消費線's monthly saving sets the years to a deposit", async () => {
  const { computeBuyVsRent } = await import("@/lib/sims/buyVsRent");
  const base = {
    choice: "buy" as const, income: 40000, savings: 100000, creditRecord: "fair" as const,
    investedAmount: 0, hasInvested: false,
    incomeKnown: true, savingsKnown: true, creditKnown: true, investedKnown: true,
  };
  const saver = computeBuyVsRent({ ...base, savingsBehavior: { direction: "surplus", amount: 5000, known: true } });
  assert.equal(saver.downPaymentShortfall, 1_500_000);
  assert.equal(saver.yearsToDownPayment, 25); // 1,500,000 ÷ (5,000 × 12)
  const short = computeBuyVsRent({ ...base, savingsBehavior: { direction: "shortfall", amount: 1000, known: true } });
  assert.equal(short.yearsToDownPayment, null);
  const rich = computeBuyVsRent({ ...base, savings: 2_000_000, savingsBehavior: { direction: "surplus", amount: 0, known: false } });
  assert.equal(rich.yearsToDownPayment, 0);
  assert.ok(parseSimResult({ kind: "capstone_buy_vs_rent_v2", outcome: saver }).ok);
});

// ---------------------------------------------------------------------------
// P2 2h: missing a payment follows 台新's published 違約金 rule and produces
// the 'poor' record the capstone has always had a branch for.
test("信用線: a missed payment costs a 違約金, keeps accruing, and records poor", async () => {
  const { computeCreditCard, LATE_FEES } = await import("@/lib/sims/creditCard");
  const { computeBuyVsRent, MORTGAGE_RATES } = await import("@/lib/sims/buyVsRent");
  const o = computeCreditCard(["missed", "missed", "full"]);
  assert.deepEqual(o.rounds.map((r) => r.lateFee), [LATE_FEES[0], LATE_FEES[1], 0]);
  assert.equal(o.totalLateFees, 700);
  assert.ok(o.rounds[1].interestAccrued > 0, "unpaid principal keeps accruing");
  assert.equal(o.record, "poor");
  assert.equal(o.creditRecord, "不佳");
  // Not consecutive → back to the first tier.
  const gap = computeCreditCard(["missed", "full", "missed"]);
  assert.deepEqual(gap.rounds.map((r) => r.lateFee), [300, 0, 300]);
  // Minimum-only is still 'fair', never 'poor'.
  assert.equal(computeCreditCard(["minimum", "minimum", "minimum"]).record, "fair");
  assert.ok(parseSimResult({ kind: "xinyong_credit_card_v2", outcome: o }).ok);
  // The capstone's poor branch is now reachable from a real result.
  const cap = computeBuyVsRent({
    choice: "buy", income: 200000, savings: 3_000_000, creditRecord: o.record,
    investedAmount: 0, hasInvested: false,
    incomeKnown: true, savingsKnown: true, creditKnown: true, investedKnown: true,
  });
  assert.equal(cap.annualRate, MORTGAGE_RATES.poor);
  assert.equal(cap.approvalLikely, false);
});

// ---------------------------------------------------------------------------
// P2 2i: five lines rendered no coach panel. Each now does, and each kind they
// produce has its own deterministic coach text rather than the generic line.
test("coach: 詐騙, 學貸, 租屋, 保險, 創業 render the coach panel", () => {
  for (const f of ["FraudSim", "StudentLoanSim", "LeaseSim", "InsuranceSim", "EntrepreneurSim"]) {
    const src = readFileSync(`components/sims/${f}.tsx`, "utf8");
    assert.match(src, /<CoachPanel runId=/, `${f} renders CoachPanel`);
  }
  const coach = readFileSync("lib/coach.ts", "utf8");
  for (const k of ["zhapian_fraud_v2", "xuedai_student_loan_v2", "zuwu_lease_v1", "baoxian_sales_pitch_v2", "chuangye_bubble_tea_v2"]) {
    const i = coach.indexOf(`case "${k}"`);
    assert.ok(i > 0, `${k} has a coach case`);
    assert.doesNotMatch(coach.slice(i, i + 80), /return generic/, `${k} is not the generic line`);
  }
});

// ---------------------------------------------------------------------------
// P3: 新聞站 is a deep, vocabulary-only station on 投資線. It changes no
// completion requirement and never turns a word into a buying rule.
test("新聞站: deep, on 投資線, vocabulary only, no selection rule", () => {
  const m = getModule(42)!;
  assert.equal(m.tier, "deep");
  assert.ok(LINES.find((l) => l.slug === "touzi")!.stationModules.includes(42));
  // The spec assumed deep stations never count toward completion. They do in
  // full mode (lib/modeModel.ts), so this station adds a third required stop
  // there; sim_first is unchanged. Reported, not hidden.
  const touzi = LINES.find((l) => l.slug === "touzi")!;
  assert.deepEqual(requiredStations(touzi, "sim_first").map((x) => x.number), [5, 8]);
  assert.deepEqual(requiredStations(touzi, "full").map((x) => x.number), [5, 8, 42]);
  assert.equal(m.quiz.length, 3);
  const src = readFileSync("components/lessons/Module42.tsx", "utf8");
  for (const w of ["加權指數", "市值", "股利", "除息", "殖利率", "EPS", "本益比"]) assert.ok(src.includes(w), w);
  assert.ok(src.includes("虛構"), "example company is labelled fictional");
  // No buying rules: "低於 X 就買", "殖利率超過 X%", "建議買進".
  assert.doesNotMatch(src.replace(/不教任何「超過多少就買」的規則/, ""), /(超過|低於|高於)[^。]{0,12}(就買|可以買|值得買)|建議買進|推薦/);
});

// ---------------------------------------------------------------------------
// Completion is kept once earned. Adding station 42 to 投資線 used to turn a
// full-mode student's finished line back into 2 of 3 and take their
// certificate away. This holds for any station added to any line.
test("completion: a station added to a finished line never takes it back", async () => {
  const { lineStatus } = await import("@/lib/progressModel");
  const base = LINES.find((l) => l.slug === "touzi")!;
  const run = { id: "r", line_slug: "touzi", created_at: "2026-01-01T00:00:00Z" } as never;
  const before = { ...base, stationModules: [5, 8] };
  const done = new Set([5, 8]);

  // 1. The student completes the line as it stood.
  const earned = lineStatus(before, done, run, "full", false);
  assert.equal(earned.complete, true);

  // 2. A station is added to the line. Live, they would now be 2 of 3…
  const after = { ...base, stationModules: [5, 8, 42] };
  const live = lineStatus(after, done, run, "full", false);
  assert.equal(live.complete, false, "live completion alone drops it");

  // 3. …but with the completion on record they keep it, the certificate's
  //    gate (complete && run) still opens, and the new station is offered.
  const kept = lineStatus(after, done, run, "full", true);
  assert.equal(kept.complete, true);
  assert.equal(kept.completedEarlier, true);
  assert.equal(kept.next?.moduleNumber, 42, "the new station is still available");
  assert.equal(kept.stationsDone, 2);
  assert.equal(kept.stationsTotal, 3);

  // A record never completes a line by itself being absent: no record, no run.
  assert.equal(lineStatus(after, done, null, "full", false).complete, false);

  // Every reader passes the stored record (compile-enforced: the parameter is
  // required) — pin the certificate's gate in particular.
  const cert = readFileSync("app/line/[slug]/certificate/page.tsx", "utf8");
  assert.match(cert, /lineStatus\(line, moduleDoneSet\(progress\), run, mode, completed\.has\(line\.slug\)\)/);
  // And both completing events record it.
  assert.match(readFileSync("app/api/progress/route.ts", "utf8"), /recordCompletionIfDone\(/);
  assert.match(readFileSync("app/api/simulation/route.ts", "utf8"), /recordCompletionIfDone\(/);
});

// ---------------------------------------------------------------------------
// The 定存 option's rate is 臺灣銀行's, so its label names a bank, not 郵局.
// Logic keys on the id; the label is display-only.
test("存錢線: the 定存 option is labelled 銀行定存", async () => {
  const { SAVINGS_STORAGE } = await import("@/lib/sims/savings");
  const td = SAVINGS_STORAGE.find((s) => s.id === "timeDeposit")!;
  assert.equal(td.label, "銀行定存");
  for (const f of ["lib/sims/savings.ts", "lib/coach.ts", "components/sims/SavingsSim.tsx"])
    assert.doesNotMatch(readFileSync(f, "utf8"), /郵局／銀行定存/, f);
});
