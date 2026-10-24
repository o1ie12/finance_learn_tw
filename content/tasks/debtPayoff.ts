/**
 * 06 P1 task 4: 雪球還是雪崩 (信用線, a 加碼任務). Four debts, one monthly
 * budget. The engine pays them month by month in both orders and with
 * minimums only, and shows the interest and months. The card rate is the
 * statutory cap and the 學貸 rate the repo's verified one; the 信貸 rate and
 * every balance are illustrative (示意).
 *
 * The last step rests on VERIFIED.md item 5 (前置協商): contact the lender
 * early; there is no "only above 22x income" condition.
 */
import { PERSONA } from "../personas";
import { LOAN_ANNUAL_RATE } from "@/lib/sims/studentLoan";
import { ANNUAL_RATE as CARD_RATE } from "@/lib/sims/creditCard";
import type { ComputeRef, StationLesson } from "@/lib/tasks/types";

/** 卡債, 信貸 (7%, 示意), 學貸, 朋友借的錢 (0%). */
const DEBTS = [
  { balance: 30_000, annualRate: CARD_RATE, min: 1_000 },
  { balance: 120_000, annualRate: 0.07, min: 2_500 },
  { balance: 200_000, annualRate: LOAN_ANNUAL_RATE, min: 2_000 },
  { balance: 10_000, annualRate: 0, min: 500 },
];
const BUDGET = 12_000;
const MINIMUMS = DEBTS.reduce((a, d) => a + d.min, 0);
const AVALANCHE = [0, 1, 2, 3]; // highest rate first
const SNOWBALL = [3, 0, 1, 2]; // smallest balance first

const run = (order: number[], field: "interest" | "months", budget = BUDGET): ComputeRef => ({
  fn: "debtPayoff",
  debts: DEBTS,
  budget,
  order,
  field,
});

export const debtPayoff: StationLesson = {
  stationId: null,
  placement: "library",
  figures: {
    budget: { ref: { fn: "sum", of: [BUDGET] }, unit: "NT$" },
    ...Object.fromEntries(
      DEBTS.flatMap((d, i) => [
        [`bal${i}`, { ref: { fn: "sum", of: [d.balance] }, unit: "NT$" as const }],
        [`min${i}`, { ref: { fn: "sum", of: [d.min] }, unit: "NT$" as const }],
      ]),
    ),
    minimums: { ref: { fn: "sum", of: [MINIMUMS] }, unit: "NT$" },
    cardRate: { ref: { fn: "repoRate", of: "cardCap" }, unit: "%" },
    loanRate: { ref: { fn: "repoRate", of: "studentLoan" }, unit: "%", digits: 3 },
    avalInterest: { ref: run(AVALANCHE, "interest"), unit: "NT$" },
    avalMonths: { ref: run(AVALANCHE, "months"), unit: "個月" },
    snowInterest: { ref: run(SNOWBALL, "interest"), unit: "NT$" },
    snowMonths: { ref: run(SNOWBALL, "months"), unit: "個月" },
    minInterest: { ref: run([], "interest", MINIMUMS), unit: "NT$" },
    minMonths: { ref: run([], "months", MINIMUMS), unit: "個月" },
    saved: { ref: { fn: "diff", a: run(SNOWBALL, "interest"), b: run(AVALANCHE, "interest") }, unit: "NT$" },
  },
  hook: {
    question: "同時欠好幾筆錢時，你會先還哪一筆？",
    options: [
      { id: "big", label: "金額最大的" },
      { id: "rate", label: "利息最高的" },
      { id: "small", label: "金額最小的" },
      { id: "loud", label: "催得最急的" },
    ],
  },
  lessonCards: [
    {
      kind: "compare",
      title: "兩種還法",
      left: { name: "雪崩法", rows: [{ label: "多的錢先還", value: "利率最高的" }, { label: "好處", value: "利息最少" }] },
      right: { name: "雪球法", rows: [{ label: "多的錢先還", value: "金額最小的" }, { label: "好處", value: "最快少掉一筆" }] },
      note: "不管哪一種，每筆的最低應繳都要先繳。",
    },
    {
      kind: "text",
      title: "還不出來，先打電話",
      body: "越早跟銀行談越好。欠銀行的錢可以申請債務協商、分期還，但會在信用紀錄上留下註記。",
    },
  ],
  task: {
    id: "xinyong.payoff.v1",
    kind: "xinyong_payoff_v1",
    title: "雪球還是雪崩",
    brief: {
      from: PERSONA.xinyong,
      message: "阿凱同時欠了四筆錢，每月能還 {{budget}}。幫他排出還錢的順序。",
      learn: "雪崩法和雪球法，還有還不出來時該怎麼辦。",
      do: "排出還錢的順序，再做一個決定。",
      minutes: 8,
    },
    materials: [
      {
        kind: "snapshot",
        data: {
          name: "阿凱的四筆欠款（示意）",
          rows: [
            { label: "卡債", value: "{{bal0}}，年利率 {{cardRate}}，每月最低 {{min0}}" },
            { label: "信貸", value: "{{bal1}}，年利率 7%，每月最低 {{min1}}" },
            { label: "學貸", value: "{{bal2}}，年利率 {{loanRate}}，每月最低 {{min2}}" },
            { label: "跟朋友借的", value: "{{bal3}}，不算利息，每月還 {{min3}}" },
            { label: "每月能拿來還錢", value: "{{budget}}" },
          ],
        },
      },
    ],
    steps: [
      {
        id: "s1",
        type: "order",
        prompt: "每筆最低應繳都繳了以後，多的錢要先還哪一筆？從先到後排好。",
        items: [
          { id: "card", label: "卡債" },
          { id: "personal", label: "信貸" },
          { id: "student", label: "學貸" },
          { id: "friend", label: "跟朋友借的" },
        ],
        answer: ["card", "personal", "student", "friend"],
        explanation:
          "先還利率最高的（雪崩法）：總利息 {{avalInterest}}，{{avalMonths}}還完。先還金額最小的（雪球法）：{{snowInterest}}，{{snowMonths}}。雪崩法省 {{saved}}；只繳最低的話，要 {{minMonths}}，利息 {{minInterest}}。",
      },
      {
        id: "s2",
        type: "choice",
        prompt: "如果哪個月真的還不出來，先做什麼？",
        options: [
          { id: "call", label: "主動打給銀行，說明狀況，談分期或協商" },
          { id: "hide", label: "先不接銀行電話，等有錢再說", explain: "不接電話，債不會消失，利息和違約金還會一直加。" },
          { id: "card", label: "再辦一張卡，用新卡繳舊卡", explain: "以卡養卡，債只會越滾越大。" },
          { id: "ad", label: "跟網路上的借貸廣告借錢", explain: "來路不明的借貸，常常是高利貸或詐騙。" },
        ],
        correct: "call",
        explanation: "越早聯絡越好。欠銀行的錢還不出來時，可以向最大債權銀行申請協商，分期最長大約 15 年，但會在信用紀錄上留下註記。",
      },
    ],
    passScore: 0.6,
    verifiedOn: "2026-10",
    sources: [
      { label: "消費者債務清理條例第 151 條", url: "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=B0010042&flno=151" },
      { label: "金融機構辦理消費者債務清理條例（前置協商）作業準則", url: "https://www.ba.org.tw/memberStandard/details?id=90" },
      { label: "銀行法第 47-1 條（信用卡利率上限）", url: "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=G0380001&flno=47-1" },
    ],
  },
  reveal: {
    bias: "鴕鳥效應",
    default: "壞消息讓人想先躲開：不看帳單、不接電話。這叫鴕鳥效應，越躲，利息和麻煩越多。",
  },
  takeaway: {
    name: "欠款三步",
    lines: ["每筆的最低應繳先繳", "多的錢先還利率最高的", "還不出來，馬上找銀行談"],
  },
  minutes: 8,
  lifeGameTurn: true,
  doLine: "排出四筆欠款的還錢順序",
};
