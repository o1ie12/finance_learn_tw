/**
 * 06 P1 task 2: 機車的真實成本 (消費線, a 加碼任務). New vs used scooter: the
 * first-year cost of each, then three years. The prices and yearly costs are
 * our own illustrative numbers (示意); every total is worked out by the engine.
 * Only the fact that 強制險 is required is real (VERIFIED.md item 6); its
 * premium here is illustrative.
 */
import { PERSONA } from "../personas";
import type { ComputeRef, StationLesson } from "@/lib/tasks/types";

const NEW_PRICE = 72_000;
const USED_PRICE = 30_000;
/** 強制險, 油錢, 保養維修, 停車費 per year (示意). The older engine uses more fuel and needs more repairs. */
const NEW_YEARLY = [600, 6_000, 1_500, 3_600];
const USED_YEARLY = [600, 7_200, 6_000, 3_600];
/** The used scooter's battery and tyres in year two (示意). */
const USED_EXTRAS = [5_000];

const new1: ComputeRef = { fn: "ownershipCost", price: NEW_PRICE, yearly: NEW_YEARLY, years: 1 };
const used1: ComputeRef = { fn: "ownershipCost", price: USED_PRICE, yearly: USED_YEARLY, years: 1 };
const new3: ComputeRef = { fn: "ownershipCost", price: NEW_PRICE, yearly: NEW_YEARLY, years: 3 };
const used3: ComputeRef = { fn: "ownershipCost", price: USED_PRICE, yearly: USED_YEARLY, years: 3, extras: USED_EXTRAS };

export const scooterCost: StationLesson = {
  stationId: null,
  placement: "library",
  figures: {
    new1: { ref: new1, unit: "NT$" },
    used1: { ref: used1, unit: "NT$" },
    new3: { ref: new3, unit: "NT$" },
    used3: { ref: used3, unit: "NT$" },
    diff3: { ref: { fn: "diff", a: new3, b: used3 }, unit: "NT$" },
    diff3wan: { ref: { fn: "diff", a: new3, b: used3 }, unit: "萬" },
  },
  hook: {
    question: "買機車的時候，你最先看什麼？",
    options: [
      { id: "price", label: "車價" },
      { id: "fuel", label: "油耗" },
      { id: "look", label: "外型" },
      { id: "warranty", label: "保固" },
    ],
  },
  lessonCards: [
    {
      kind: "text",
      title: "標價只是冰山一角",
      body: "車價之外，每年還有保險、油錢、保養和停車。二手車便宜，但老車的維修常常比較多。",
    },
    {
      kind: "formula",
      title: "一台車真正的花費",
      formula: "車價 ＋ 每年的花費 × 年數 ＋ 可能的維修",
      example: "先把每一項列出來，再加總，不要只看車價。",
    },
  ],
  task: {
    id: "qixin.scooter.v1",
    kind: "qixin_scooter_cost_v1",
    title: "機車的真實成本",
    brief: {
      from: PERSONA.qixin,
      message: "我想買機車，新車和二手車還在猶豫。幫我算算第一年和三年各要花多少。",
      learn: "標價之外，一台車每年還要花多少。",
      do: "算兩個數字，再比較三年的總花費。",
      minutes: 8,
    },
    materials: [
      {
        kind: "billSheet",
        data: {
          title: "新車：第一年（示意）",
          rows: [
            { item: "車價", amount: NEW_PRICE },
            { item: "強制險", amount: NEW_YEARLY[0] },
            { item: "油錢", amount: NEW_YEARLY[1] },
            { item: "保養", amount: NEW_YEARLY[2] },
            { item: "停車費", amount: NEW_YEARLY[3] },
          ],
        },
      },
      {
        kind: "billSheet",
        data: {
          title: "二手車：第一年（示意）",
          rows: [
            { item: "車價", amount: USED_PRICE },
            { item: "強制險", amount: USED_YEARLY[0] },
            { item: "油錢（老車比較耗油）", amount: USED_YEARLY[1] },
            { item: "保養維修", amount: USED_YEARLY[2] },
            { item: "停車費", amount: USED_YEARLY[3] },
          ],
        },
      },
      {
        kind: "billSheet",
        data: {
          title: "二手車：第二年預估還要換（示意）",
          rows: [{ item: "電瓶和輪胎", amount: USED_EXTRAS[0] }],
        },
      },
    ],
    steps: [
      {
        id: "s1",
        type: "number",
        prompt: "新車第一年總共要花多少？",
        answer: new1,
        unit: "NT$",
        explanation: "車價，加上一年的強制險、油錢、保養和停車：{{new1}}。",
      },
      {
        id: "s2",
        type: "number",
        prompt: "二手車第一年總共要花多少？",
        answer: used1,
        unit: "NT$",
        explanation: "車價便宜很多，但油錢和維修比較貴：{{used1}}。",
      },
      {
        id: "s3",
        type: "choice",
        prompt: "騎三年的話，哪一台比較省？",
        options: [
          { id: "new", label: "新車比較省" },
          { id: "same", label: "兩台差不多" },
          { id: "used2", label: "二手車比較省，大約差 NT${{diff3wan}}" },
          { id: "used5", label: "二手車比較省，差超過 NT$5 萬" },
        ],
        correct: "used2",
        explanation: "三年下來，新車 {{new3}}，二手車 {{used3}}（含第二年換電瓶和輪胎），二手車省 {{diff3}}。買二手車前，先請懂車的人檢查。",
      },
    ],
    passScore: 0.6,
  },
  reveal: {
    bias: "錨定效應",
    default: "第一個看到的數字（車價）會變成判斷的標準，讓人忽略每年都要付的錢。這叫錨定效應。",
  },
  takeaway: {
    name: "買東西前先算總價",
    lines: ["標價", "每年的固定花費", "可能的維修"],
  },
  minutes: 8,
  lifeGameTurn: true,
  doLine: "算出一台機車的真實花費",
};
