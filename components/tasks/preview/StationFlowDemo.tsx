"use client";

/**
 * Dev-only: StationFlow with a hard-coded lesson that has one step of every
 * type (plus a reflection step) and all five lesson card kinds. Scores
 * locally with the real scoreTask / pickReveal. Every figure is 示意; every
 * name is fictional. Mounted only by app/design-preview/tasks (404 in prod).
 */

import { answerKey } from "@/lib/tasks/publicLesson";
import { useState } from "react";
import { getLine, LINES } from "@/lib/lines";
import { pickReveal } from "@/lib/tasks/reveal";
import { scoreTask } from "@/lib/tasks/scoring";
import type { CreditReportData, StationLesson } from "@/lib/tasks/types";
import { StationFlow, type SubmitPayload, type SubmitResult } from "../StationFlow";

const STUDENT_ID = "preview-student";
const GOAL = { amount: 30000, months: 10 };

function report(r: CreditReportData): { kind: "creditReport"; data: CreditReportData } {
  return { kind: "creditReport", data: r };
}

const LESSON: StationLesson = {
  stationId: null,
  placement: "station",
  minutes: 15,
  lifeGameTurn: true,
  hook: {
    question: "第一張信用卡帳單寄來了，你最先看哪個數字？",
    options: [
      { id: "total", label: "總共要繳多少" },
      { id: "minimum", label: "最少要繳多少" },
      { id: "due", label: "哪一天前要繳" },
      { id: "skip", label: "先不看，之後再說" },
    ],
  },
  lessonCards: [
    {
      kind: "text",
      title: "帳單上最重要的三個數字",
      body: "本期應繳總額、最低應繳金額、繳款截止日。只繳最低，剩下的會從入帳日開始算利息。",
    },
    {
      kind: "compare",
      title: "兩種繳法（示意）",
      left: { name: "小安：繳全額", rows: [{ label: "這期繳", value: "NT$6,390" }, { label: "下期利息", value: "NT$0" }] },
      right: { name: "小凱：繳最低", rows: [{ label: "這期繳", value: "NT$600" }, { label: "下期利息", value: "約 NT$107" }] },
      note: "數字為示意。",
    },
    { kind: "flow", title: "收到帳單後", steps: ["看截止日", "對每一筆消費", "決定繳多少", "截止日前繳費"] },
    {
      kind: "matrix",
      title: "花錢前先分一下",
      xLabel: ["不急", "很急"],
      yLabel: ["不需要", "需要"],
      cells: ["先不要買", "想清楚再說", "排進計畫", "現在處理"],
      axisTitles: { x: "急不急", y: "需不需要" },
    },
    { kind: "formula", title: "沒繳的錢會長利息", formula: "沒繳的金額 × 年利率 ÷ 365 × 天數", example: "NT$5,790 × 15% ÷ 365 × 45 天 ≈ NT$107（示意）" },
  ],
  task: {
    id: "preview.statement.v1",
    kind: "preview_statement_v1",
    title: "你的第一張帳單",
    brief: {
      from: { name: "林經理", role: "放款主管", org: "星河銀行" },
      message: "你的第一張帳單寄出了。先找到關鍵數字，再決定怎麼繳。",
      learn: "帳單上哪些數字最重要，只繳最低會怎樣。",
      do: "在帳單上找出關鍵欄位，再做兩個決定。",
      minutes: 9,
    },
    passScore: 0.6,
    afterTip: "設定自動扣繳全額，就不會忘記繳。",
    materials: [
      {
        kind: "cardStatement",
        data: {
          bank: "星河銀行",
          month: "2026/10",
          closingDate: "10/15",
          dueDate: "10/30",
          limit: 20000,
          interest: 0,
          transactions: [
            { date: "9/19", postDate: "9/21", desc: "藍牙耳機", amount: 2490 },
            { date: "10/3", postDate: "10/4", desc: "聚餐", amount: 860 },
            { date: "10/8", postDate: "10/9", desc: "線上課程", amount: 1990 },
            { date: "10/12", postDate: "10/13", desc: "高鐵票", amount: 1050 },
          ],
        },
      },
      report({
        name: "陳怡君",
        age: 28,
        job: "護理師",
        income: "52,000",
        tenure: "4 年",
        cards: { count: "2 張", utilization: "18%", late12: "0 次" },
        loans: "學貸 2,800",
        inquiries3m: "1 次",
        guarantor: "無",
        derogatory: "無",
        score: "680",
        application: "信貸 150,000 進修",
      }),
      report({
        name: "林冠宇",
        age: 24,
        job: "業務",
        income: "平均 38,000，近半年 26,000 到 60,000",
        tenure: "1 年",
        cards: { count: "3 張", utilization: "85%", late12: "2 次" },
        loans: "0",
        inquiries3m: "5 次",
        guarantor: "無",
        derogatory: "無",
        score: "560",
        application: "信貸 300,000 換車",
      }),
      report({
        name: "張雅婷",
        age: 22,
        job: "行政助理",
        income: "30,000",
        tenure: "3 個月",
        cards: { count: "0 張", utilization: "無", late12: "無" },
        loans: "0",
        inquiries3m: "0 次",
        guarantor: "無",
        derogatory: "無",
        score: "無資料",
        application: "第一張信用卡 額度 30,000",
      }),
    ],
    steps: [
      {
        id: "find-three",
        type: "find",
        prompt: "點出：本期應繳總額、最低應繳金額、繳款截止日",
        materialIndex: 0,
        targets: ["totalDue", "minimumDue", "dueDate"],
        explainTargets: {
          totalDue: "本期應繳總額：這期全部要繳的錢。",
          minimumDue: "最低應繳金額：繳這麼多只是不算遲繳。",
          dueDate: "繳款截止日：最晚這天要繳。",
        },
        explanation: "這三個數字決定你這個月怎麼繳。",
      },
      {
        id: "pay",
        type: "choice",
        prompt: "這個月你戶頭有 NT$8,000，你要繳多少？",
        options: [
          { id: "full", label: "全額 NT$6,390", explain: "繳全額就不用付利息。" },
          { id: "min", label: "最低應繳", explain: "只繳最低不算遲繳，但沒繳的部分會開始算利息。" },
          { id: "part", label: "繳 NT$3,000", explain: "沒繳的部分一樣從入帳日開始算利息。" },
          { id: "none", label: "先不繳", explain: "不繳會有違約金，還會留下遲繳紀錄。" },
        ],
        correct: "full",
        reasons: [
          { id: "a", label: "繳全額就完全不用付利息，信用紀錄也最好。" },
          { id: "b", label: "繳最低就不算遲繳，所以沒差。" },
          { id: "c", label: "留著錢比較安心，利息應該不多。" },
        ],
        correctReason: "a",
        explanation: "全額繳清。最低應繳只代表不算遲繳，不代表沒事。",
      },
      {
        id: "interest",
        type: "number",
        prompt: "如果這期只繳最低，下期帳單大約會多出多少利息？",
        answer: { fn: "cardInterestIfMinimum", total: 6390 },
        tolerance: 5,
        unit: "NT$",
        explanation: "沒繳的部分從每筆的入帳日開始算利息，一路算到下次結帳。",
      },
      {
        id: "bank",
        type: "rate",
        prompt: "你是銀行：給每份申請 1、2 或 3 分。",
        scale: [
          { value: 1, label: "不核准" },
          { value: 2, label: "小額或要求更多資料" },
          { value: 3, label: "核准" },
        ],
        drawCount: 2,
        items: [
          {
            id: "r1",
            label: "陳怡君：信貸 150,000 進修",
            materialIndex: 1,
            answer: 3,
            explain: "收入穩、使用率低、從不遲繳。後來準時還完。",
            highlight: ["income", "cards.utilization", "cards.late12"],
          },
          {
            id: "r2",
            label: "林冠宇：信貸 300,000 換車",
            materialIndex: 2,
            answer: 1,
            explain: "卡幾乎刷爆、最近兩次遲繳、三個月申請五次。後來開始遲繳。",
            highlight: ["cards.utilization", "cards.late12", "inquiries3m"],
          },
          {
            id: "r3",
            label: "張雅婷：第一張信用卡",
            materialIndex: 3,
            answer: 2,
            explain: "信用小白，不是信用差。銀行先核小額度，一年後調高。",
            highlight: ["score", "cards.count"],
          },
        ],
        explanation: "一個小細節就能改變答案。",
      },
      {
        id: "fields",
        type: "sort",
        prompt: "每個問題，要看帳單上的哪一欄？",
        boxes: [
          { id: "totalDue", label: "本期應繳總額" },
          { id: "minimumDue", label: "最低應繳金額" },
          { id: "dueDate", label: "繳款截止日" },
          { id: "closingDate", label: "結帳日" },
          { id: "limit", label: "信用額度" },
        ],
        items: [
          { id: "q1", label: "這期全部要繳多少？", box: "totalDue" },
          { id: "q2", label: "繳多少才不算遲繳？", box: "minimumDue", explain: "不算遲繳，不等於不用付利息。" },
          { id: "q3", label: "最晚哪天要繳？", box: "dueDate" },
          { id: "q4", label: "這期帳單算到哪天的消費？", box: "closingDate" },
          { id: "q5", label: "最多可以刷多少？", box: "limit" },
        ],
        explanation: "每一欄回答一個問題。",
      },
      {
        id: "steps",
        type: "order",
        prompt: "收到帳單後，照順序排好。",
        items: [
          { id: "pay", label: "在截止日前繳費" },
          { id: "check", label: "對一下每筆是不是自己刷的" },
          { id: "due", label: "先看繳款截止日" },
          { id: "decide", label: "決定要繳多少" },
        ],
        answer: ["due", "check", "decide", "pay"],
        explanation: "先知道期限，再確認內容，最後才付錢。",
      },
      {
        id: "reflect",
        type: "choice",
        scored: false,
        prompt: "你覺得自己最容易被帳單上哪個數字影響？",
        options: [
          { id: "total", label: "總額" },
          { id: "min", label: "最低應繳" },
          { id: "due", label: "截止日" },
          { id: "none", label: "都不太會" },
        ],
        explanation: "知道自己會被哪個數字帶走，下次就比較不會。",
      },
    ],
  },
  reveal: {
    bias: "最低應繳的錨定",
    outcomeFrom: { stepId: "pay", map: { full: "paidFull", min: "paidMin", part: "paidPartial", none: "paidNone" } },
    byOutcome: {
      paidMin: "帳單把「最低應繳」印得很清楚，很多人就把它當成該繳的金額。這就是錨定：一個數字先出現，就變成你的標準。",
      paidPartial: "繳一部分比只繳最低好，但沒繳的部分一樣從入帳日開始算利息。",
      paidNone: "不繳會有違約金，還會留下遲繳紀錄，之後借錢都會更難。",
      paidFull: "你沒被最低應繳帶走。很多人第一眼看到那個小數字，就以為繳那樣就好。",
    },
    default: "帳單上最小的那個數字，最容易被當成標準。",
  },
  takeaway: { name: "看帳單三步", lines: ["先看截止日", "盡量繳全額", "繳不出來時，先停刷再想辦法"] },
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function StationFlowDemo() {
  const line = getLine("xinyong") ?? LINES[0];
  const [run, setRun] = useState<{ key: number; attempt: number; hook: string | null }>({ key: 1, attempt: 1, hook: null });
  const [log, setLog] = useState<string[]>([]);
  const note = (msg: string) => setLog((l) => [msg, ...l].slice(0, 5));

  async function onSubmit(p: SubmitPayload): Promise<SubmitResult> {
    await wait(300);
    setRun((r) => ({ ...r, hook: p.hookAnswer }));
    const score = scoreTask(LESSON.task, p.answers, { goal: GOAL, studentId: STUDENT_ID, attempt: run.attempt });
    note(`onSubmit：第 ${run.attempt} 次，${score.score.toFixed(2)} / ${score.total}`);
    return {
      score: score.score,
      total: score.total,
      passed: score.passed,
      details: score.details,
      stationDone: score.passed || run.attempt >= 2 || score.total === 0,
      reveal: pickReveal(LESSON.reveal, p.hookAnswer, p.answers),
      attempt: run.attempt,
      answerKey: answerKey(LESSON.task, GOAL),
    };
  }

  return (
    <>
      <div className="g-card" style={{ maxWidth: 1180, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <p className="g-label" style={{ margin: 0 }}>
          開發用預覽 · 資料皆為示意 · 名稱皆為虛構
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <span className="g-caption">第 {run.attempt} 次嘗試</span>
          <button
            type="button"
            className="g-pill"
            style={{ border: 0, cursor: "pointer", fontFamily: "inherit" }}
            onClick={() => setRun((r) => ({ key: r.key + 1, attempt: 1, hook: null }))}
          >
            重新開始
          </button>
          {log.length > 0 ? (
            <span className="g-caption" aria-live="polite">
              {log[0]}
            </span>
          ) : null}
        </div>
      </div>
      <StationFlow
        key={run.key}
        lesson={LESSON}
        line={line}
        station={{ name: "帳單站", code: "CREDIT LINE · STATION 1" }}
        studentId={STUDENT_ID}
        attempt={run.attempt}
        goal={GOAL}
        fullLessonHref="/design-preview/tasks#full-lesson"
        onSubmit={onSubmit}
        onSaveTool={async (name) => {
          await wait(300);
          note(`onSaveTool：${name}`);
        }}
        onRetry={() => setRun((r) => ({ ...r, key: r.key + 1, attempt: r.attempt + 1 }))}
        startAtTask={run.attempt > 1}
        initialHookAnswer={run.hook}
        onContinue={() => note("onContinue：回到你的人生（示範）")}
      />
    </>
  );
}
