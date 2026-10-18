/**
 * 職涯線. Copy from 04-CONTENT §1.2, §2 and §3, pasted verbatim.
 *
 * Placement (lead): Task A → station 39, Task B → station 40. The terminal is
 * the existing career simulation, wrapped with the line's reveal.
 * 04 §1.2's money-cycle card sits on Task A (station 39 is the first station
 * of the course in the recommended order).
 *
 * Figures: salaries and bills are 04 §3's own scenario (A's bills sum to
 * 21,099, B's to 13,699). 實發 is a ComputeRef (lib/lifeGame/payroll.ts).
 * Companies are fictional.
 */

import type { BiasReveal, LineContent } from "@/lib/tasks/types";

const lineHook = {
  question: "月薪多 NT$5,000 但要搬去台北，你會去嗎？",
  options: [
    { id: "go", label: "會去" },
    { id: "stay", label: "不會去" },
    { id: "calc", label: "要先算清楚" },
  ],
};

const lineReveal: BiasReveal = {
  bias: "只看月薪",
  default: "人很容易只盯著最大的那個數字。月薪最醒目，但房租和通勤會默默吃掉差距。",
};

export const content: LineContent = {
  slug: "zhiya",
  hook: lineHook,
  bias: "只看月薪",
  takeaway: { name: "工作比較表", lines: ["實拿", "房租", "通勤", "成長"] },
  unlocks: "你選的工作、學技能、課程特價事件",
  lessons: [
    // --- Task A: 你的興趣地圖 (station 39) ---------------------------------------
    {
      stationId: 39,
      placement: "station",
      hook: lineHook,
      lessonCards: [
        {
          kind: "flow",
          title: "錢的七件事",
          steps: [
            "賺：用工作換收入",
            "存：為目標先留住錢",
            "花：有計畫地花",
            "借：守住信用，量力而為",
            "保：把大又少見的風險轉出去",
            "投：讓錢替你工作，也投資自己",
            "助：幫助別人，也是錢的用途",
          ],
        },
        {
          // 04 §1.2's caption, verbatim, moved to its own card so the flow card
          // stays short. Title added (04 silent).
          kind: "text",
          title: "你每天都在做",
          body: "你每天都在做這些決定，只是沒發現：早餐要不要加飲料？手機一次買還是分期？同學都去玩，我要不要跟？",
        },
        {
          kind: "compare",
          title: "喜歡的 ≠ 擅長的",
          left: {
            name: "喜歡的",
            rows: [
              { label: "做了不會累", value: "" },
              { label: "會主動想多做", value: "" },
            ],
          },
          right: {
            name: "擅長的",
            rows: [
              { label: "別人常找你幫忙", value: "" },
              { label: "做得比同學快", value: "" },
            ],
          },
          note: "兩個都有的地方，最值得先試。",
        },
      ],
      task: {
        id: "zhiya.interest.v1",
        kind: "zhiya_interest_map_v1",
        title: "你的興趣地圖",
        brief: {
          role: "你",
          situation: "在選工作之前，先弄清楚自己喜歡什麼、擅長什麼。",
        },
        materials: [],
        steps: [
          {
            id: "s1",
            type: "sort",
            scored: false,
            prompt: "把這 8 張卡分到喜歡、擅長、都有、都沒有。",
            boxes: [
              { id: "like", label: "喜歡" },
              { id: "good", label: "擅長" },
              { id: "both", label: "都有" },
              { id: "neither", label: "都沒有" },
            ],
            // Card ids are mapped to the existing interest buckets in code (04 §3 Output).
            items: [
              { id: "design", label: "畫畫或設計" },
              { id: "persuade", label: "跟人聊天說服別人" },
              { id: "fix", label: "修東西或組裝" },
              { id: "care", label: "照顧別人" },
              { id: "numbers", label: "算數字和整理資料" },
              { id: "create", label: "寫文章或拍影片" },
              { id: "cook", label: "做菜" },
              { id: "code", label: "寫程式或玩電腦" },
            ],
            explanation: "兩個都有的地方，最值得先試。",
          },
          {
            id: "s2",
            type: "choice",
            scored: false,
            prompt: "選工作時，你最在意哪一個？",
            options: [
              { id: "salary", label: "薪水" },
              { id: "near_home", label: "離家近" },
              { id: "stable", label: "工作穩定" },
              { id: "learning", label: "能學到東西" },
            ],
            profileKey: "careerPriority",
            explanation: "知道自己最在意什麼，比較工作時才不會只看月薪。",
          },
        ],
        passScore: 0.6,
      },
      // Added (04 silent): Task A is a reflection about interests, so the line's
      // 月薪 reveal does not fit it; a neutral default in the same voice.
      reveal: {
        bias: "只看一個面向",
        default: "人常把喜歡和擅長混在一起看。分開看，才找得到兩個都有的地方。",
      },
      takeaway: {
        name: "興趣地圖",
        lines: ["喜歡的：做了不會累，會主動想多做", "擅長的：別人常找你幫忙，做得比同學快", "兩個都有的地方，最值得先試"],
      },
      minutes: 5,
      lifeGameTurn: true,
      doLine: "畫出你的興趣地圖",
    },

    // --- Task B: 比較兩份工作 (station 40) ---------------------------------------
    {
      stationId: 40,
      placement: "station",
      hook: {
        question: "兩份工作，一份月薪多 NT$4,000，你會直接選它嗎？",
        options: [
          { id: "yes", label: "會" },
          { id: "calc", label: "先算每月剩多少" },
          { id: "unsure", label: "不確定" },
        ],
      },
      lessonCards: [
        {
          kind: "text",
          title: "比較工作要看什麼",
          body: "比較工作要看『實拿 − 生活成本』，不是只看月薪。",
        },
      ],
      task: {
        id: "zhiya.compare.v1",
        kind: "zhiya_compare_jobs_v1",
        title: "比較兩份工作",
        brief: {
          role: "剛畢業的你",
          situation: "你拿到兩份工作。先別看月薪，算算每個月真的剩多少。",
        },
        materials: [
          { kind: "payslip", data: { company: "雲朵行銷公司", month: "2026/08", gross: 34000 } },
          {
            kind: "billSheet",
            data: {
              title: "工作 A 台北行銷助理：每月帳單",
              rows: [
                { item: "台北雅房房租", amount: 8000 },
                { item: "水電", amount: 900 },
                { item: "餐費", amount: 9000 },
                { item: "交通", amount: 1200 },
                { item: "手機", amount: 499 },
                { item: "日用品", amount: 1500 },
              ],
            },
          },
          { kind: "payslip", data: { company: "桃李行政公司", month: "2026/08", gross: 30000 } },
          {
            kind: "billSheet",
            data: {
              title: "工作 B 桃園行政助理：每月帳單（住家裡）",
              rows: [
                { item: "孝親費", amount: 3000 },
                { item: "餐費", amount: 7500 },
                { item: "交通", amount: 1200 },
                { item: "手機", amount: 499 },
                { item: "日用品", amount: 1500 },
              ],
            },
          },
        ],
        steps: [
          {
            id: "s1",
            type: "number",
            prompt: "工作 A 實發多少？",
            answer: { fn: "netPay", gross: 34000 },
            tolerance: 0,
            unit: "NT$",
            explanation: "實發是月薪扣掉勞保和健保自付的部分，看薪資單最下面那一行。",
          },
          {
            id: "s2",
            type: "number",
            prompt: "工作 A 每月繳完帳單還剩多少？",
            answer: { fn: "netPayMinus", gross: 34000, minus: 21099 },
            unit: "NT$",
            explanation: "工作 A 的實發，減掉台北的帳單合計 NT$21,099。",
          },
          {
            id: "s3",
            type: "number",
            prompt: "工作 B 每月繳完帳單還剩多少？",
            answer: { fn: "netPayMinus", gross: 30000, minus: 13699 },
            unit: "NT$",
            explanation: "工作 B 的實發，減掉住家裡的帳單合計 NT$13,699。",
          },
          {
            id: "s4",
            type: "choice",
            prompt: "只看錢，哪份工作每月剩比較多？",
            options: [
              { id: "a", label: "工作 A" },
              { id: "b", label: "工作 B" },
            ],
            correct: "b",
            reasons: [
              { id: "r1", label: "B 雖然月薪少 NT$4,000，但住家裡省下房租和水電。" },
              { id: "r2", label: "A 月薪比較高，所以剩比較多。" },
              { id: "r3", label: "兩份差不多。" },
            ],
            correctReason: "r1",
            explanation:
              "錢不是唯一標準。A 的經驗可能讓你三年後薪水更高。這一站只是教你：比較工作要看『實拿 − 生活成本』，不是只看月薪。",
          },
        ],
        passScore: 0.6,
      },
      reveal: lineReveal,
      takeaway: {
        name: "工作比較表",
        lines: ["實拿多少", "要花多少住和通勤", "每月剩多少", "能學到什麼"],
      },
      minutes: 7,
      lifeGameTurn: true,
      doLine: "比較兩份工作每月剩多少",
    },
  ],
  terminal: { reveal: lineReveal },
};
