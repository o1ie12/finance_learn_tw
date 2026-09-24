/**
 * Contract check for simulation results. Run with: npx tsx scripts/check-sim-contract.ts
 *
 * Exists because a green build is not evidence that consumers can read what
 * the simulations write. When 信用線's simulation was replaced, the coach, the
 * 護照 stamp and the certificate all kept reading the previous shape and
 * rendered NT$0 figures; nothing failed. This asserts what a typecheck cannot:
 * that every live simulation's stored outcome actually satisfies the contract
 * its consumers rely on, that malformed results are refused at the boundary,
 * and that unreadable rows fall back rather than fabricate.
 *
 * Exits non-zero on failure, so it can gate CI.
 */
import { dispatchSimulation } from "@/lib/sims/dispatch";
import { parseSimResult, readStoredResult, UNREADABLE_RESULT_TEXT } from "@/lib/sims/types";
import { outcomeTitleFor } from "@/lib/outcomeTitle";
import type { SimulationRun } from "@/lib/types";

const CASES: Array<[string, Record<string, unknown>]> = [
  ["qixin", { rent: "roommates", tpass: true, savingsRate: 40 }],
  ["cunqian", { goalId: "concert", storageId: "bank", months: 12, monthlyDeposit: 2000, temptationResponses: [true] }],
  ["xinyong", { choices: ["minimum", "minimum", "minimum"] }],
  ["touzi", { choice: "buy0050", ipo: true }],
  ["zhapian", { answers: {} }],
  ["xuedai", { school: "public", housing: "dorm", loanCoversPct: 50 }],
  ["baoshui", { character: "mingming" }],
  ["zuwu", { flagged: [] }],
  ["baoxian", { decisions: { savings: "buy", accident: "decline", reimbursement: "decline" } }],
  ["chuangye", { priceId: "low", prepId: "medium" }],
];

let fail = 0;

console.log("A. every live simulation satisfies the contract");
for (const [slug, body] of CASES) {
  const d = dispatchSimulation(slug, body);
  if (!d.ok) { console.log(`  FAIL ${slug}: dispatch ${d.error}`); fail++; continue; }
  const v = parseSimResult({ kind: d.storeInput.kind, outcome: d.storeInput.outcome_summary });
  if (!v.ok) { console.log(`  FAIL ${slug}: ${v.error}`); fail++; continue; }
  console.log(`  ok   ${slug.padEnd(9)} -> ${d.storeInput.kind}`);
}

console.log("\nB. malformed shapes are rejected, not stored");
const bad: Array<[string, unknown]> = [
  ["missing required field", { kind: "xinyong_credit_card_v1", outcome: { totalPaid: 1 } }],
  ["wrong type",             { kind: "zhapian_fraud_v1", outcome: { correct: "3", total: 20 } }],
  ["unknown kind",           { kind: "something_invented_v9", outcome: {} }],
  ["kind absent",            { outcome: { totalInterest: 211 } }],
];
for (const [label, input] of bad) {
  const v = parseSimResult(input);
  if (v.ok) { console.log(`  FAIL ${label}: accepted`); fail++; }
  else console.log(`  ok   rejected (${label}) — ${v.error}`);
}

console.log("\nC. legacy and unknown rows fall back, never fabricate");
const legacy: Array<[string, unknown, unknown]> = [
  ["pre-contract row (kind null)", null, { chosen: { leftover: 5000 } }],
  ["kind this build lacks",        "future_sim_v2", { anything: 1 }],
  ["kind right, shape wrong",      "xinyong_credit_card_v1", { chosen: { leftover: 0 } }],
];
for (const [label, kind, outcome] of legacy) {
  const r = readStoredResult(kind, outcome);
  const run = { kind, outcome_summary: outcome, spending_choices: {}, savings_rate: null } as unknown as SimulationRun;
  const stamp = outcomeTitleFor(run);
  const okFallback = r === null && stamp === null;
  console.log(`  ${okFallback ? "ok  " : "FAIL"} ${label} -> result=${r === null ? "null" : "parsed"}, stamp=${stamp === null ? "none" : stamp.title}`);
  if (!okFallback) fail++;
}

console.log("\nD. the retired 信用線 housing shape still reads correctly");
const housing = readStoredResult("xinyong_housing_v1", { chosen: { leftover: 4200 } });
const housingRun = {
  kind: "xinyong_housing_v1",
  outcome_summary: { chosen: { leftover: 4200 } },
  spending_choices: { housing: "roommates" },
  savings_rate: null,
} as unknown as SimulationRun;
const housingStamp = outcomeTitleFor(housingRun);
console.log(`  result=${housing ? "parsed" : "null"}, stamp=${housingStamp?.title ?? "none"} (expect 合租族)`);
if (!housing || housingStamp?.title !== "合租族") fail++;

console.log(`\nfallback text: ${UNREADABLE_RESULT_TEXT}`);
console.log(fail === 0 ? "\nALL PASS" : `\n${fail} FAILURE(S)`);
process.exit(fail === 0 ? 0 : 1);
