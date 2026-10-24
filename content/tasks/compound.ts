/**
 * 06 P1 task 3: 複利與 72 法則 (存錢線, on 複利站). Two savers with the same
 * monthly amount, one starting at 18 and one at 28, compounded by the engine
 * at 2% and at 6%. 6% stands for a long-run market return: an illustration,
 * never a promise (06 section 3 item 2 rules out the deck's 15%). Then the
 * rule of 72 on the repo's own card cap and 定存 rate.
 */
import { PERSONA } from "../personas";
import type { ComputeRef, StationLesson } from "@/lib/tasks/types";

const MONTHLY = 2_000;
const fv = (annualRate: number, years: number): ComputeRef => ({ fn: "savingsFV", monthly: MONTHLY, annualRate, years });
const A18_6 = fv(0.06, 42);
const B28_6 = fv(0.06, 32);

export const compound: StationLesson = {
  stationId: 3,
  placement: "station",
  figures: {
    monthly: { ref: { fn: "sum", of: [MONTHLY] }, unit: "NT$" },
    dep18: { ref: fv(0, 42), unit: "NT$" },
    dep28: { ref: fv(0, 32), unit: "NT$" },
    a18_2: { ref: fv(0.02, 42), unit: "NT$" },
    b28_2: { ref: fv(0.02, 32), unit: "NT$" },
    a18_6: { ref: A18_6, unit: "NT$" },
    b28_6: { ref: B28_6, unit: "NT$" },
    depDiff: { ref: { fn: "diff", a: fv(0, 42), b: fv(0, 32) }, unit: "NT$" },
    lateGap: { ref: { fn: "diff", a: A18_6, b: B28_6 }, unit: "NT$" },
    cardRate: { ref: { fn: "repoRate", of: "cardCap" }, unit: "%" },
    card72: { ref: { fn: "rule72", annualRate: "cardCap" }, unit: "年", digits: 1 },
    cardExact: { ref: { fn: "doublingYears", annualRate: "cardCap" }, unit: "年", digits: 1 },
    depRate: { ref: { fn: "repoRate", of: "timeDeposit1y" }, unit: "%", digits: 1 },
    dep72: { ref: { fn: "rule72", annualRate: "timeDeposit1y" }, unit: "年", digits: 1 },
  },
  hook: {
    question: "18 歲開始存錢和 28 歲才開始，到 60 歲時會差很多嗎？",
    options: [
      { id: "little", label: "差不多" },
      { id: "some", label: "差一點" },
      { id: "lot", label: "差很多" },
    ],
  },
  lessonCards: [
    {
      kind: "compare",
      title: "每月 {{monthly}}，存到 60 歲，年利率 2%（示意）",
      left: {
        name: "阿哲：18 歲開始",
        rows: [
          { label: "自己存進去", value: "{{dep18}}" },
          { label: "60 歲時", value: "{{a18_2}}" },
        ],
      },
      right: {
        name: "小琪：28 歲開始",
        rows: [
          { label: "自己存進去", value: "{{dep28}}" },
          { label: "60 歲時", value: "{{b28_2}}" },
        ],
      },
      note: "利息也會生利息，這就是複利。報酬率越高、時間越長，差距越大。",
    },
    {
      kind: "formula",
      title: "72 法則",
      formula: "72 ÷ 年利率（%）≈ 錢翻倍要幾年",
      example: "年利率 8%：72 ÷ 8 ＝ 大約 9 年翻倍。",
    },
  ],
  task: {
    id: "cunqian.compound.v1",
    kind: "cunqian_compound_v1",
    title: "複利與 72 法則",
    brief: {
      from: PERSONA.cunqian,
      message: "阿哲 18 歲開始存錢，小琪 28 歲才開始。幫我算算 60 歲時差多少。",
      learn: "複利和 72 法則：錢和債是怎麼翻倍的。",
      do: "估兩個數字，再用 72 法則算兩題。",
      minutes: 10,
    },
    materials: [
      {
        kind: "snapshot",
        data: {
          name: "兩個人的存錢計畫（示意）",
          rows: [
            { label: "阿哲", value: "18 歲開始，每月 {{monthly}}，存到 60 歲" },
            { label: "小琪", value: "28 歲開始，每月 {{monthly}}，存到 60 歲" },
            { label: "年報酬", value: "6%（長期投資的示意，不保證）" },
          ],
        },
      },
    ],
    steps: [
      {
        id: "s1",
        type: "choice",
        ordered: true,
        prompt: "年報酬 6% 時，阿哲 60 歲時大約有多少？",
        options: [
          { id: "m100", label: "約 NT$100 萬" },
          { id: "m230", label: "約 NT$230 萬" },
          { id: "m450", label: "約 NT$450 萬" },
          { id: "m900", label: "約 NT$900 萬" },
        ],
        correctNearest: { ref: A18_6, values: { m100: 1_000_000, m230: 2_300_000, m450: 4_500_000, m900: 9_000_000 } },
        explanation: "阿哲自己存了 {{dep18}}，6% 時 60 歲會有 {{a18_6}}。多出來的，大部分是利息再生的利息。",
      },
      {
        id: "s2",
        type: "choice",
        ordered: true,
        prompt: "小琪晚 10 年開始，60 歲時大約比阿哲少多少？",
        options: [
          { id: "m50", label: "約少 NT$50 萬" },
          { id: "m100", label: "約少 NT$100 萬" },
          { id: "m220", label: "約少 NT$220 萬" },
          { id: "m500", label: "約少 NT$500 萬" },
        ],
        correctNearest: {
          ref: { fn: "diff", a: A18_6, b: B28_6 },
          values: { m50: 500_000, m100: 1_000_000, m220: 2_200_000, m500: 5_000_000 },
        },
        explanation: "小琪只少存了 {{depDiff}}，60 歲時卻少了 {{lateGap}}（她有 {{b28_6}}）。最早存的錢，滾得最久。",
      },
      {
        id: "s3",
        type: "number",
        prompt: "卡債年利率 {{cardRate}}，用 72 法則算，大約幾年會翻倍？",
        answer: { fn: "rule72", annualRate: "cardCap" },
        tolerance: 0.3,
        unit: "年",
        explanation: "72 ÷ {{cardRate}} ≈ {{card72}}，精算是 {{cardExact}}。欠 NT$1 萬不還，大約 {{cardExact}}就變 NT$2 萬。",
      },
      {
        id: "s4",
        type: "number",
        prompt: "一年期定存年利率 {{depRate}}，用 72 法則算，大約幾年會翻倍？",
        answer: { fn: "rule72", annualRate: "timeDeposit1y" },
        tolerance: 2,
        unit: "年",
        explanation: "72 ÷ {{depRate}} ≈ {{dep72}}。同樣是翻倍，欠款翻得很快，存款翻得很慢。",
      },
    ],
    passScore: 0.6,
    verifiedOn: "2026-10",
    sources: [
      { label: "臺灣銀行 新臺幣存款牌告利率（一年期定存）", url: "https://rate.bot.com.tw/twd?Lang=zh-TW" },
      { label: "銀行法第 47-1 條（信用卡利率上限）", url: "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=G0380001&flno=47-1" },
    ],
  },
  reveal: {
    bias: "指數成長偏誤",
    default: "人常把複利想成直線，以為晚幾年開始只少一點。這叫指數成長偏誤：越早開始，差距越大。",
  },
  takeaway: {
    name: "72 法則",
    lines: ["72 ÷ 年利率 ≈ 翻倍要幾年", "存錢越早開始越好", "卡債翻倍得更快"],
  },
  minutes: 10,
  lifeGameTurn: true,
  doLine: "用 72 法則看錢和債怎麼翻倍",
};
