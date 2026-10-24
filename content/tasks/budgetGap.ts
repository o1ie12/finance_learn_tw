/**
 * 06 P1 task 1: 預算缺口 (消費線, a 加碼任務). A fictional person has money left
 * every month, but a full year's budget, with the one-off and surprise costs,
 * shows a gap. Every figure is worked out by the engine (figures below); the
 * inputs are our own illustrative numbers, labelled 示意 on screen.
 */
import { PERSONA } from "../personas";
import type { StationLesson } from "@/lib/tasks/types";

const INCOME = 34_000;
const SPEND = 31_800;
/** 機車保養, 換手機, 家人生日禮物, 看牙醫, 朋友婚禮紅包, 證照考試報名 (示意). */
const EXTRAS = [2_400, 12_000, 4_000, 3_500, 3_600, 4_500];
const EXTRAS_NO_PHONE = [2_400, 4_000, 3_500, 3_600, 4_500];

export const budgetGap: StationLesson = {
  stationId: null,
  placement: "library",
  figures: {
    income: { ref: { fn: "sum", of: [INCOME] }, unit: "NT$" },
    spend: { ref: { fn: "sum", of: [SPEND] }, unit: "NT$" },
    left: { ref: { fn: "diff", a: INCOME, b: SPEND }, unit: "NT$" },
    yearLeft: { ref: { fn: "diff", a: 0, b: { fn: "budgetGap", monthlyIncome: INCOME, monthlySpend: SPEND, extras: [] } }, unit: "NT$" },
    extraTotal: { ref: { fn: "sum", of: EXTRAS }, unit: "NT$" },
    gap: { ref: { fn: "budgetGap", monthlyIncome: INCOME, monthlySpend: SPEND, extras: EXTRAS }, unit: "NT$" },
    perMonth: { ref: { fn: "div", a: { fn: "budgetGap", monthlyIncome: INCOME, monthlySpend: SPEND, extras: EXTRAS }, by: 12 }, unit: "NT$" },
    phoneLater: { ref: { fn: "diff", a: 0, b: { fn: "budgetGap", monthlyIncome: INCOME, monthlySpend: SPEND, extras: EXTRAS_NO_PHONE } }, unit: "NT$" },
  },
  hook: {
    question: "每個月扣掉花費都還有剩，這一年就一定存得到錢嗎？",
    options: [
      { id: "yes", label: "一定" },
      { id: "maybe", label: "不一定" },
      { id: "luck", label: "看運氣" },
    ],
  },
  lessonCards: [
    {
      kind: "text",
      title: "一年不只有十二張帳單",
      body: "保養、換手機、紅包、看牙：不是每個月都有，但一年裡一定會來。先把它們算進一年的預算。",
    },
    {
      kind: "flow",
      title: "補缺口的三個方法",
      steps: ["少花一點", "多賺一點", "把時間拉長"],
    },
  ],
  task: {
    id: "qixin.budgetgap.v1",
    kind: "qixin_budget_gap_v1",
    title: "預算缺口",
    brief: {
      from: PERSONA.qixin,
      message: "我每個月都有剩，年底卻沒存到錢。幫我把這一年的預算算清楚。",
      learn: "為什麼每個月有剩，一年下來還是會缺錢。",
      do: "算出一年的缺口，再選一個補法。",
      minutes: 8,
    },
    materials: [
      {
        kind: "snapshot",
        data: {
          name: "小安的每月預算（示意）",
          rows: [
            { label: "實領月薪", value: "{{income}}" },
            { label: "每月花費合計", value: "{{spend}}" },
            { label: "每月剩下", value: "{{left}}" },
          ],
        },
      },
      {
        kind: "billSheet",
        data: {
          title: "這一年還會有的花費（示意）",
          rows: [
            { item: "機車保養", amount: EXTRAS[0] },
            { item: "手機換新", amount: EXTRAS[1] },
            { item: "家人生日禮物", amount: EXTRAS[2] },
            { item: "看牙醫", amount: EXTRAS[3] },
            { item: "朋友婚禮紅包", amount: EXTRAS[4] },
            { item: "證照考試報名", amount: EXTRAS[5] },
          ],
        },
      },
    ],
    steps: [
      {
        id: "s1",
        type: "number",
        prompt: "這一年的缺口是多少？（一年的額外花費，減掉每月剩下的 × 12）",
        answer: { fn: "budgetGap", monthlyIncome: INCOME, monthlySpend: SPEND, extras: EXTRAS },
        unit: "NT$",
        explanation: "每月剩 {{left}}，一年剩 {{yearLeft}}。額外的花費共 {{extraTotal}}，所以差了 {{gap}}。",
      },
      {
        id: "s2",
        type: "number",
        prompt: "要補上這個缺口，平均每個月要多出多少？",
        answer: { fn: "div", a: { fn: "budgetGap", monthlyIncome: INCOME, monthlySpend: SPEND, extras: EXTRAS }, by: 12 },
        unit: "NT$",
        explanation: "{{gap}} ÷ 12 個月 = 每月 {{perMonth}}。",
      },
      {
        id: "s3",
        type: "choice",
        scored: false,
        prompt: "你會怎麼補這個缺口？",
        options: [
          { id: "cut", label: "每月少花 {{perMonth}}，例如少喝幾杯手搖" },
          { id: "earn", label: "每月多賺 {{perMonth}}，例如多接一次家教" },
          { id: "stretch", label: "手機晚一年再換" },
        ],
        explanation: "三種都可以：每月少花 {{perMonth}}、每月多賺 {{perMonth}}，或手機晚一年換，這一年還會多出 {{phoneLater}}。沒有唯一的答案，只有你做得到的那個。",
      },
    ],
    passScore: 0.6,
  },
  reveal: {
    bias: "規劃謬誤",
    default: "做計畫時，人常常只想到每個月固定的帳，忘了一年才來一次的花費。這叫規劃謬誤。",
  },
  takeaway: {
    name: "一年預算三步",
    lines: ["先算每月剩多少", "再列一年才來一次的花費", "缺口用少花、多賺或拉長時間補"],
  },
  minutes: 8,
  lifeGameTurn: true,
  doLine: "算出一年的預算缺口",
};
