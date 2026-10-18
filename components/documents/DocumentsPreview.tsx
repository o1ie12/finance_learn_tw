"use client";

/**
 * Dev-only gallery for /design-preview/documents: every document with sample
 * data from 04-CONTENT.md, in reading mode and in find mode. Not linked from
 * anywhere; the page 404s in production.
 */

import { useState } from "react";
import { netPay } from "@/lib/lifeGame/payroll";
import type { Material, NewsCardData, PriceChartData } from "@/lib/tasks/types";
import { materialTitle, renderMaterial, type CellState } from "./index";
import p from "./preview.module.css";

const INCOME = netPay(32000);

const LEDGER_ROWS: { label: string; value: number | null }[] = [
  { label: "月初現金", value: 5000 },
  { label: "收入", value: null },
  { label: "存錢", value: 3200 },
  { label: "帳單", value: 15199 },
  { label: "行動", value: 1320 },
  { label: "事件", value: 800 },
  { label: "月底現金", value: null },
];
const LEDGER_ANSWERS: Record<number, number> = {
  1: INCOME,
  6: 5000 + INCOME - 3200 - 15199 - 1320 - 800,
};

interface Sample {
  material: Material;
  /** Field ids highlighted when 「顯示關鍵」 is on. */
  highlight?: string[];
  note?: string;
}

function samples(chart: PriceChartData, news: NewsCardData): Sample[] {
  return [
    {
      note: "職涯線 Task B 工作 A",
      material: { kind: "payslip", data: { company: "晨光行銷有限公司", month: "2026/07", gross: 34000 } },
      highlight: ["net"],
    },
    {
      note: "加班費與勞退自提 6%",
      material: {
        kind: "payslip",
        data: { company: "青禾行政顧問", month: "2026/08", gross: 30000, overtime: 2400, pensionRate: 0.06 },
      },
    },
    {
      note: "信用線 Task A",
      material: {
        kind: "cardStatement",
        data: {
          bank: "星河銀行",
          month: "2026/10",
          closingDate: "10/15",
          dueDate: "10/30",
          limit: 20000,
          transactions: [
            { date: "9/19", postDate: "9/21", desc: "藍牙耳機", amount: 2490 },
            { date: "10/3", postDate: "10/4", desc: "聚餐", amount: 860 },
            { date: "10/8", postDate: "10/9", desc: "線上課程", amount: 1990 },
            { date: "10/12", postDate: "10/13", desc: "高鐵票", amount: 1050 },
          ],
          totalDue: 6390,
          interest: 0,
        },
      },
      highlight: ["totalDue", "minimumDue", "dueDate", "col:postDate"],
    },
    {
      note: "信用線 Task B 檔案 #16",
      material: {
        kind: "creditReport",
        data: {
          name: "王詩涵",
          age: 25,
          job: "銀行櫃員",
          income: "38,000",
          tenure: "2 年",
          cards: { count: "2", utilization: "8%", late12: "0" },
          loans: "0",
          inquiries3m: "0",
          guarantor: "朋友的機車分期 80,000（朋友已遲繳 2 期）",
          derogatory: "無",
          score: "620",
          application: "信貸 50,000",
        },
      },
      highlight: ["guarantor"],
    },
    {
      note: "信用線 Task C",
      material: {
        kind: "chat",
        data: {
          contact: "阿凱",
          messages: [
            { time: "21:14", from: "them", text: "欸在嗎" },
            { time: "21:14", from: "them", text: "可以先借我 5000 嗎 月底就還你" },
            { time: "21:15", from: "me", text: "怎麼了？" },
            { time: "21:16", from: "them", text: "想買新的球鞋 限量的 今天不買就沒了" },
            { time: "21:16", from: "them", text: "我打工薪水下個月才會進來", image: "限量球鞋的截圖" },
            { time: "21:17", from: "them", text: "上次跟小傑借的 1500 我還沒還他 但這次一定還你" },
          ],
        },
      },
      highlight: ["msg:3", "msg:5"],
    },
    {
      note: "詐騙線案件 2（通話）",
      material: {
        kind: "chat",
        data: {
          contact: "自稱檢察官的人",
          mode: "call",
          messages: [
            { time: "10:02", from: "them", text: "這裡是地檢署，你的帳戶涉及洗錢案。" },
            { time: "10:02", from: "me", text: "什麼？我沒有做這種事。" },
            { time: "10:03", from: "them", text: "這是偵查不公開，不能告訴家人。" },
            { time: "10:04", from: "them", text: "請把存款轉到監管帳戶，查完就退給你。網址 case-check.example 可以查案號。" },
          ],
        },
      },
      highlight: ["msg:2", "msg:3"],
    },
    {
      note: "職涯線 Task B 工作 A",
      material: {
        kind: "billSheet",
        data: {
          title: "台北生活帳單",
          rows: [
            { item: "雅房房租", amount: 8000, day: "每月 1 日" },
            { item: "水電", amount: 900, day: "每月 20 日" },
            { item: "餐費", amount: 9000 },
            { item: "交通", amount: 1200 },
            { item: "手機", amount: 499, day: "每月 15 日" },
            { item: "日用品", amount: 1500 },
          ],
        },
      },
      highlight: ["row:0"],
    },
    {
      note: "人生遊戲記帳（填空）",
      material: { kind: "ledger", data: { rows: LEDGER_ROWS } },
    },
    {
      note: "保險線",
      material: {
        kind: "policy",
        data: {
          insurer: "穩橋產物保險",
          type: "傷害保險（意外險）",
          premium: "每年 NT$1,800",
          term: "1 年，每年續保",
          coverage: ["意外身故或失能：最高 NT$1,000,000", "意外住院：每天 NT$1,000", "意外門診：實支實付，每次最高 NT$20,000"],
          exclusions: ["酒後或無照駕駛", "疾病造成的住院", "故意自傷"],
        },
      },
      highlight: ["exclusions:1"],
    },
    {
      note: "租屋線",
      material: { kind: "lease", data: { clauseIds: ["c2", "c3", "c5", "c6"] } },
      highlight: ["clause:c3"],
    },
    {
      note: "投資線 Task A",
      material: {
        kind: "snapshot",
        data: {
          name: "小安",
          rows: [
            { label: "存款", value: "NT$60,000" },
            { label: "每月必要開銷", value: "NT$18,000" },
            { label: "卡債", value: "NT$0" },
          ],
        },
      },
    },
    {
      note: "投資線 Task A",
      material: {
        kind: "snapshot",
        data: {
          name: "阿德",
          rows: [
            { label: "存款", value: "NT$80,000" },
            { label: "卡債", value: "NT$25,000（循環中）" },
          ],
        },
      },
      highlight: ["row:1"],
    },
    { note: "投資線 Task C（真實資料）", material: { kind: "priceChart", data: chart } },
    { note: "投資線 Task C", material: { kind: "newsCard", data: news } },
  ];
}

export default function DocumentsPreview({ chart, news }: { chart: PriceChartData; news: NewsCardData }) {
  const list = samples(chart, news);
  const [findMode, setFindMode] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [locked, setLocked] = useState(false);
  const [selected, setSelected] = useState<Record<number, Set<string>>>({});
  const [values, setValues] = useState<Record<number, string>>({});
  const [cellState, setCellState] = useState<Record<number, CellState>>({});

  const toggle = (doc: number, field: string) =>
    setSelected((prev) => {
      const next = new Set(prev[doc] ?? []);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return { ...prev, [doc]: next };
    });

  const checkLedger = () => {
    const out: Record<number, CellState> = {};
    for (const [k, answer] of Object.entries(LEDGER_ANSWERS)) {
      const i = Number(k);
      const typed = Number((values[i] ?? "").replace(/[^\d-]/g, ""));
      out[i] = (values[i] ?? "").trim() === "" ? "neutral" : typed === answer ? "ok" : "wrong";
    }
    setCellState(out);
  };

  return (
    <div className={p.page}>
      <header className={p.bar}>
        <h1 className={p.h1}>文件元件預覽</h1>
        <div className={p.controls} role="group" aria-label="預覽設定">
          <button type="button" className={p.btn} aria-pressed={findMode} onClick={() => setFindMode((v) => !v)}>
            找找看模式
          </button>
          <button type="button" className={p.btn} aria-pressed={showKey} onClick={() => setShowKey((v) => !v)}>
            顯示關鍵
          </button>
          <button type="button" className={p.btn} aria-pressed={locked} onClick={() => setLocked((v) => !v)}>
            鎖定作答
          </button>
        </div>
      </header>

      <div className={p.grid}>
        {list.map((sample, i) => {
          const m = sample.material;
          return (
            <div key={i} className={p.item}>
              <p className={p.label}>
                {i + 1}. {materialTitle(m)}
                {sample.note && <span className={p.note}>　{sample.note}</span>}
              </p>
              {renderMaterial(m, {
                headingLevel: 2,
                find: findMode
                  ? { selected: selected[i] ?? new Set(), onToggle: (f) => toggle(i, f), disabled: locked }
                  : undefined,
                highlight: showKey ? sample.highlight : undefined,
                ledger:
                  m.kind === "ledger"
                    ? {
                        values,
                        onChange: (row, v) => setValues((prev) => ({ ...prev, [row]: v })),
                        cellState,
                        hints: { 1: "收入是實發金額，不是月薪。", 6: "月初現金 + 收入，再減掉其他四項。" },
                        readOnly: locked,
                      }
                    : undefined,
              })}
              {m.kind === "ledger" && !findMode && (
                <button type="button" className={p.btn} onClick={checkLedger}>
                  檢查
                </button>
              )}
              {findMode && (
                <p className={p.picked}>已選：{[...(selected[i] ?? [])].join("、") || "無"}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
