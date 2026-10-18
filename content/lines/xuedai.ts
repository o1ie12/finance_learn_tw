/**
 * 學貸線 content (04 §11). One new task at station 14 (學費站); the existing
 * three-phase loan sim stays the terminal, wrapped with a reveal.
 *
 * Monthly repayments are never typed here: they come from
 * lib/sims/studentLoan.ts (0.775% after graduation, 2-year grace, 10-year
 * repayment, the last one illustrative; sources cited on LOAN_ANNUAL_RATE) via the studentLoanMonthly
 * ComputeRef.
 */
import type { LineContent, BiasReveal } from "@/lib/tasks/types";

const reveal: BiasReveal = {
  bias: "只看現在",
  default: "現在不用付的錢，感覺就不像是錢。這是只看現在的偏誤。",
};

export const content: LineContent = {
  slug: "xuedai",
  hook: {
    question: "在學期間不用付利息，那借多一點也沒關係？",
    options: [
      { id: "yes", label: "對" },
      { id: "no", label: "不對" },
      { id: "unsure", label: "不確定" },
    ],
  },
  bias: "只看現在",
  takeaway: {
    name: "先算畢業後每月要還多少",
    lines: ["借你需要的，不是借你能借的。"],
  },
  unlocks: "生活帳單上出現你選的學貸還款",
  lessons: [
    {
      stationId: 14,
      placement: "station",
      hook: {
        question: "在學期間不用付利息，那借多一點也沒關係？",
        options: [
          { id: "yes", label: "對" },
          { id: "no", label: "不對" },
          { id: "unsure", label: "不確定" },
        ],
      },
      lessonCards: [
        {
          kind: "text",
          title: "現在不用付，不代表不用付",
          body: "畢業後的每個月，都會有一筆固定的還款。先算出來，再決定借多少。",
        },
        {
          // Added (04 silent): the NumberSteps need a way to estimate by hand.
          // 120 months = LOAN_REPAYMENT_YEARS (10) × 12, lib/sims/studentLoan.ts,
          // which is ILLUSTRATIVE there, so the card says 示意.
          kind: "formula",
          title: "每月還款怎麼估",
          formula: "借款 ÷ 120 個月（示意），再加一點利息",
          example: "示意：借 NT$120,000，本金每月 NT$1,000，再加一點利息。實際月數依借款學期數而定。",
        },
      ],
      task: {
        id: "xuedai.monthly.v1",
        kind: "xuedai_monthly_v1",
        title: "畢業後每月要還多少",
        brief: {
          role: "你是剛考上大學的新生。",
          situation: "學費加生活費不少，你在想要借多少學貸。",
        },
        materials: [
          {
            kind: "snapshot",
            data: {
              // Terms from lib/sims/studentLoan.ts (LOAN_ANNUAL_RATE, GRACE_YEARS,
              // LOAN_REPAYMENT_YEARS); sources cited there.
              name: "學貸條件",
              rows: [
                { label: "在學期間利息", value: "政府負擔" },
                { label: "畢業後年利率", value: "0.775%" },
                { label: "開始還款", value: "畢業滿兩年後" },
                { label: "還款期間", value: "10 年（示意，實際依借款學期數而定）" },
              ],
            },
          },
        ],
        steps: [
          {
            id: "s1",
            type: "number",
            prompt: "如果借 NT$400,000，畢業後每月要還多少？",
            answer: { fn: "studentLoanMonthly", principal: 400000 },
            tolerance: 100,
            unit: "NT$",
            explanation:
              "NT$400,000 ÷ 120 個月（示意的還款期間）是 NT$3,333，再加上利息就是答案。利率很低，所以只多一點。",
          },
          {
            id: "s2",
            type: "number",
            prompt: "如果只借學費 NT$200,000，生活費靠打工，每月要還多少？",
            answer: { fn: "studentLoanMonthly", principal: 200000 },
            tolerance: 50,
            unit: "NT$",
            explanation: "借一半，每月還款也大約是一半。",
          },
          {
            id: "s3",
            type: "choice",
            prompt: "起薪 NT$32,000，你會選哪個？",
            options: [
              { id: "a", label: "借 40 萬" },
              { id: "b", label: "借 20 萬加打工" },
              { id: "c", label: "看情況" },
            ],
            correct: "c",
            reasons: [
              { id: "r1", label: "先算每月還款占薪水多少，再看打工會不會影響課業。" },
              { id: "r2", label: "利息很低，借越多越好。" },
              { id: "r3", label: "學貸很可怕，完全不要借。" },
            ],
            correctReason: "r1",
            explanation: "學貸利率很低，是好用的工具。重點是借你需要的，不是借你能借的。",
          },
        ],
        passScore: 0.6,
      },
      reveal,
      takeaway: {
        name: "先算畢業後每月要還多少",
        lines: ["借你需要的，不是借你能借的。"],
      },
      minutes: 8, // lib/modules.ts station 14
      lifeGameTurn: true,
      doLine: "算算畢業後每月要還多少",
    },
  ],
  terminal: { reveal },
};
