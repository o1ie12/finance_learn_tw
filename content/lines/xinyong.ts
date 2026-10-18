/**
 * 信用線 (pilot line). Copy from 04-CONTENT §2 and §4, pasted verbatim.
 *
 * Placement (lead): Task A → station 4, Task B → station 7,
 * Task C → library, Task D → terminal.
 *
 * Figures:
 * - Card statement amounts are 04's own scenario (sum 6,390). 最低應繳 and the
 *   "only minimum" interest are ComputeRefs (lib/tasks/compute.ts), never typed.
 * - 循環利率法定上限 15%: already verified in the repo (04 §15, "card interest
 *   from 入帳日 and the 15% cap").
 * - 信用評分 200 到 800 分 and 「暫時無法評分」: docs/redesign/sources.md item 10.
 * - 無擔保借款不超過月收入 22 倍 (DBR22): docs/redesign/sources.md item 11.
 * - The 18 credit reports are fictional; the creditReport document labels the
 *   score 「信用評分（示意）」 and carries 「名稱皆為虛構」.
 */

import type { CreditReportData, LineContent } from "@/lib/tasks/types";

const lineHook = {
  question: "卡費只繳最低應繳，算是有好好繳嗎？",
  options: [
    { id: "yes", label: "算" },
    { id: "no", label: "不算" },
    { id: "unsure", label: "不確定" },
  ],
};

const borrowTwoQuestions = {
  name: "借錢兩問",
  lines: ["真的需要嗎？", "還得起嗎？"],
};

// --- Task B: the 18 files (04 §4B table, in table order) -------------------------

const reports: CreditReportData[] = [
  {
    name: "陳怡君",
    age: 28,
    job: "護理師",
    income: "52,000",
    tenure: "4 年",
    cards: { count: "2", utilization: "18%", late12: "0" },
    loans: "學貸 2,800",
    inquiries3m: "1",
    guarantor: "無",
    derogatory: "無",
    score: "680",
    application: "信貸 150,000 進修",
  },
  {
    name: "林冠宇",
    age: 24,
    job: "業務",
    income: "平均 38,000，近半年 26,000 到 60,000",
    tenure: "1 年",
    cards: { count: "3", utilization: "85%", late12: "2" },
    loans: "0",
    inquiries3m: "5",
    guarantor: "無",
    derogatory: "無",
    score: "560",
    application: "信貸 300,000 換車",
  },
  {
    name: "張雅婷",
    age: 22,
    job: "行政助理",
    income: "30,000",
    tenure: "3 個月",
    cards: { count: "0", utilization: "無", late12: "無" },
    loans: "0",
    inquiries3m: "0",
    guarantor: "無",
    derogatory: "無",
    score: "此次暫時無法評分",
    application: "第一張信用卡 額度 30,000",
  },
  {
    name: "黃志明",
    age: 35,
    job: "工程師",
    income: "85,000",
    tenure: "8 年",
    cards: { count: "4", utilization: "10%", late12: "0" },
    loans: "房貸 28,000",
    inquiries3m: "0",
    guarantor: "弟弟的車貸 600,000",
    derogatory: "無",
    score: "700",
    application: "信貸 500,000",
  },
  {
    name: "吳佩珊",
    age: 30,
    job: "自己開咖啡店",
    income: "去年報稅所得 480,000 (月均 40,000)，每月起伏大",
    tenure: "2 年",
    cards: { count: "2", utilization: "40%", late12: "0" },
    loans: "0",
    inquiries3m: "1",
    guarantor: "無",
    derogatory: "無",
    score: "640",
    application: "創業貸款 200,000",
  },
  {
    name: "劉建宏",
    age: 41,
    job: "公務員",
    income: "62,000",
    tenure: "15 年",
    cards: { count: "1", utilization: "5%", late12: "0" },
    loans: "0",
    inquiries3m: "0",
    guarantor: "無",
    derogatory: "無",
    score: "740",
    application: "信貸 100,000 修房子",
  },
  {
    name: "蔡宗翰",
    age: 27,
    job: "外送員",
    income: "平均 35,000",
    tenure: "3 年",
    cards: { count: "2", utilization: "95%", late12: "1" },
    loans: "機車分期 3,000",
    inquiries3m: "3",
    guarantor: "無",
    derogatory: "兩年前被強制停卡",
    score: "520",
    application: "信貸 80,000 還卡債",
  },
  {
    name: "鄭心怡",
    age: 26,
    job: "設計師",
    income: "45,000",
    tenure: "2 年",
    cards: { count: "2", utilization: "30%", late12: "0" },
    loans: "0",
    inquiries3m: "6",
    guarantor: "無",
    derogatory: "無",
    score: "600",
    application: "信貸 200,000 投資股票",
  },
  {
    name: "許家豪",
    age: 33,
    job: "醫院行政",
    income: "48,000",
    tenure: "6 年",
    cards: { count: "2", utilization: "25%", late12: "0" },
    loans: "車貸 9,000",
    inquiries3m: "1",
    guarantor: "無",
    derogatory: "無",
    score: "670",
    application: "信貸 120,000 辦婚禮",
  },
  {
    name: "楊雅雯",
    age: 29,
    job: "補習班老師",
    income: "鐘點制，平均 40,000",
    tenure: "1 年",
    cards: { count: "1", utilization: "20%", late12: "0" },
    loans: "學貸 3,000",
    inquiries3m: "2",
    guarantor: "無",
    derogatory: "無",
    score: "630",
    application: "信貸 60,000",
  },
  {
    name: "周俊傑",
    age: 38,
    job: "貨車司機",
    income: "55,000",
    tenure: "10 年",
    cards: { count: "5", utilization: "70%", late12: "0" },
    loans: "信貸 12,000 + 車貸 15,000",
    inquiries3m: "2",
    guarantor: "無",
    derogatory: "無",
    score: "610",
    application: "信貸 300,000 整合負債",
  },
  {
    name: "江美玲",
    age: 45,
    job: "家管",
    income: "本人無收入",
    tenure: "無",
    cards: { count: "1 (附卡)", utilization: "無", late12: "0" },
    loans: "0",
    inquiries3m: "0",
    guarantor: "無",
    derogatory: "無",
    score: "此次暫時無法評分",
    application: "信貸 100,000",
  },
  {
    name: "謝承恩",
    age: 23,
    job: "工程師",
    income: "48,000",
    tenure: "6 個月",
    cards: { count: "1", utilization: "15%", late12: "0" },
    loans: "學貸 2,500",
    inquiries3m: "0",
    guarantor: "無",
    derogatory: "無",
    score: "650",
    application: "第二張信用卡",
  },
  {
    name: "何品妤",
    age: 31,
    job: "自由接案翻譯",
    income: "去年報稅所得 560,000",
    tenure: "接案 3 年",
    cards: { count: "2", utilization: "12%", late12: "0" },
    loans: "0",
    inquiries3m: "1",
    guarantor: "無",
    derogatory: "無",
    score: "690",
    application: "信貸 150,000 買設備",
  },
  {
    name: "羅志偉",
    age: 50,
    job: "餐廳主廚",
    income: "70,000",
    tenure: "3 年 (五年換四份工作)",
    cards: { count: "3", utilization: "60%", late12: "1 (11 個月前)" },
    loans: "房貸 25,000",
    inquiries3m: "2",
    guarantor: "無",
    derogatory: "無",
    score: "610",
    application: "信貸 400,000",
  },
  {
    name: "王詩涵",
    age: 25,
    job: "銀行櫃員",
    income: "38,000",
    tenure: "2 年",
    cards: { count: "2", utilization: "8%", late12: "0" },
    loans: "0",
    inquiries3m: "0",
    guarantor: "朋友的機車分期 80,000 (朋友已遲繳 2 期)",
    derogatory: "無",
    score: "620",
    application: "信貸 50,000",
  },
  {
    name: "陳柏翰",
    age: 34,
    job: "軟體工程師",
    income: "120,000",
    tenure: "5 年",
    cards: { count: "6", utilization: "3%", late12: "0" },
    loans: "0",
    inquiries3m: "5 (上個月)",
    guarantor: "無",
    derogatory: "無",
    score: "700",
    application: "信貸 600,000",
  },
  {
    name: "林宛蓉",
    age: 27,
    job: "護理師",
    income: "50,000",
    tenure: "3 年",
    cards: { count: "2", utilization: "35%", late12: "0" },
    loans: "0",
    inquiries3m: "1",
    guarantor: "無",
    derogatory: "無",
    score: "660",
    application: "信貸 700,000 買加密貨幣",
  },
];

/** Per file, in table order: rating, 關鍵細節 → 後來, and the fields that mattered. */
const verdicts: {
  answer: 1 | 2 | 3;
  alsoFull?: (1 | 2 | 3)[];
  explain: string;
  highlight: string[];
}[] = [
  {
    answer: 3,
    explain: "收入穩、使用率低、從不遲繳 → 準時還完",
    highlight: ["income", "cards.utilization", "cards.late12"],
  },
  {
    answer: 1,
    explain: "卡幾乎刷爆、最近兩次遲繳、三個月申請五次 → 半年後開始遲繳",
    highlight: ["cards.utilization", "cards.late12", "inquiries3m"],
  },
  {
    answer: 2,
    explain: "信用小白，不是信用差 → 銀行先核 NT$20,000 額度，一年後調高",
    highlight: ["cards.count", "score"],
  },
  {
    answer: 2,
    explain: "自己很好，但當了大額保證人，弟弟沒還就要他還 → 銀行降到 200,000",
    highlight: ["guarantor"],
  },
  {
    answer: 2,
    explain: "收入不固定，需要看報稅和店的帳 → 補了資料後核 120,000",
    highlight: ["job", "income"],
  },
  {
    answer: 3,
    explain: "收入最穩、幾乎沒負債 → 準時還完",
    highlight: ["job", "tenure", "loans"],
  },
  {
    answer: 1,
    explain: "有停卡紀錄、卡刷到 95% → 銀行建議先找銀行談債務協商",
    highlight: ["derogatory", "cards.utilization"],
  },
  {
    answer: 1,
    explain: "三個月內申請六次，而且是借錢投資 → 被拒後她改成每月定期定額",
    highlight: ["inquiries3m", "application"],
  },
  {
    answer: 3,
    explain: "加上新貸款，每月要還的也不到收入三成 → 準時還完",
    highlight: ["income", "loans"],
  },
  {
    answer: 3,
    alsoFull: [2],
    explain: "收入不固定，但借得少、紀錄好 → 準時還完",
    highlight: ["income", "application", "cards.late12"],
  },
  {
    answer: 1,
    explain: "每月要還 27,000，快一半收入了 → 銀行建議找債務協商，不再加貸",
    highlight: ["loans", "income"],
  },
  {
    answer: 1,
    explain: "申請人自己沒有收入，還款來源不明 → 改由有收入的家人申請",
    highlight: ["income", "job"],
  },
  {
    answer: 3,
    explain: "年資短，但收入穩、用卡習慣好 → 核卡",
    highlight: ["tenure", "income", "cards.utilization"],
  },
  {
    answer: 3,
    explain: "接案也能借，關鍵是三年都有報稅紀錄 → 準時還完",
    highlight: ["income", "tenure"],
  },
  {
    answer: 2,
    explain: "收入不錯但工作常換、借很多 → 核 150,000",
    highlight: ["tenure", "loans", "cards.utilization"],
  },
  {
    answer: 2,
    explain: "她擔保的人已經遲繳，債可能落到她身上 → 核 30,000",
    highlight: ["guarantor"],
  },
  {
    answer: 2,
    explain: "收入很高，但一個月內突然到處申請，可能急需用錢 → 銀行要求說明用途",
    highlight: ["inquiries3m"],
  },
  {
    answer: 1,
    explain: "借月薪 14 倍去做高風險投資 → 銀行拒絕",
    highlight: ["application", "income"],
  },
];

export const content: LineContent = {
  slug: "xinyong",
  hook: lineHook,
  bias: "最低應繳的錨定",
  takeaway: borrowTwoQuestions,
  unlocks: "信用卡、還卡債、保證人事件",
  lessons: [
    // --- Task A: 你的第一張帳單 (station 4) ---------------------------------------
    {
      stationId: 4,
      placement: "station",
      hook: lineHook,
      lessonCards: [
        {
          kind: "text",
          title: "帳單上最重要的三個數字",
          body: "本期應繳總額、最低應繳金額、繳款截止日。只繳最低，剩下的會從每筆消費的入帳日開始算利息。",
        },
      ],
      task: {
        id: "xinyong.statement.v1",
        kind: "xinyong_statement_v1",
        title: "你的第一張帳單",
        brief: {
          role: "18 歲上大學，剛辦了第一張信用卡",
          situation: "第一張帳單寄來了。先看懂，再決定怎麼繳。",
        },
        materials: [
          {
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
        ],
        steps: [
          {
            id: "s1",
            type: "find",
            prompt: "點出：本期應繳總額、最低應繳金額、繳款截止日",
            materialIndex: 0,
            targets: ["totalDue", "minimumDue", "dueDate"],
            explainTargets: {
              totalDue: "這一期全部要繳的錢。繳這個數字，就不用付利息。",
              minimumDue: "繳這個只代表不算遲繳。沒繳的部分會開始算利息。",
              dueDate: "這天之前要繳。晚了會有違約金和遲繳紀錄。",
            },
            explanation: "帳單上最重要的三個數字：本期應繳總額、最低應繳金額、繳款截止日。",
          },
          {
            id: "s2",
            type: "find",
            prompt: "如果只繳最低，利息會從哪一天開始算？點出那個欄位。",
            materialIndex: 0,
            targets: ["col:postDate"],
            explainTargets: {
              "col:postDate": "入帳日是銀行先幫你付錢的那天。利息從這天開始算，不是從截止日。",
            },
            explanation: "只繳最低，剩下的會從每筆消費的入帳日開始算利息。",
          },
          {
            id: "s3",
            type: "choice",
            prompt: "這個月你戶頭有 NT$8,000，你要繳多少？",
            options: [
              { id: "full", label: "全額 NT$6,390" },
              { id: "min", label: "最低應繳" },
              { id: "partial", label: "繳 NT$3,000" },
              { id: "none", label: "先不繳" },
            ],
            correct: "full",
            reasons: [
              { id: "r1", label: "繳全額就完全不用付利息，信用紀錄也最好。" },
              { id: "r2", label: "繳最低就不算遲繳，所以沒差。" },
              { id: "r3", label: "留著錢比較安心，利息應該不多。" },
            ],
            correctReason: "r1",
            // 15%: 信用卡循環利率法定上限, verified in the repo (04 §15).
            explanation:
              "全額繳清。最低應繳只代表『不算遲繳』，不代表沒事。沒繳的部分每天都在算利息，信用卡循環利率法定上限是年利率 15%。",
          },
          {
            id: "s4",
            type: "number",
            prompt: "如果這期只繳最低，下期帳單大約會多出多少利息？",
            answer: { fn: "cardInterestIfMinimum", total: 6390 },
            // 45 days = POSTED_DAYS_BEFORE_STATEMENT + STATEMENT_CYCLE_DAYS in
            // lib/sims/creditCard.ts (an average; real bills count per charge).
            tolerance: 10,
            unit: "NT$",
            explanation:
              "示意算法：沒繳的 NT$5,790 × 15% ÷ 365 × 平均 45 天 ≈ NT$107。實際帳單會從每一筆消費自己的入帳日開始算。",
          },
        ],
        passScore: 0.6,
      },
      reveal: {
        bias: "最低應繳的錨定",
        outcomeFrom: {
          stepId: "s3",
          map: { full: "paidFull", min: "paidMin", partial: "paidPartial", none: "paidNone" },
        },
        byOutcome: {
          paidMin:
            "帳單把『最低應繳』印得很清楚，很多人就把它當成『該繳的金額』。這就是錨定：一個數字先出現，就變成你的標準。",
          paidPartial: "繳一部分比只繳最低好，但沒繳的部分一樣從入帳日開始算利息。",
          paidNone: "不繳會有違約金，還會留下遲繳紀錄，之後借錢都會更難。",
          paidFull: "你沒被最低應繳帶走。很多人第一眼看到那個小數字，就以為繳那樣就好。",
        },
        default: "帳單上最小的那個數字，最容易被當成標準。",
      },
      takeaway: {
        name: "看帳單三步",
        lines: ["先看截止日", "盡量繳全額", "繳不出來時，先停刷再想辦法"],
      },
      minutes: 10,
      lifeGameTurn: true,
      doLine: "看懂第一張帳單，決定怎麼繳",
    },

    // --- Task B: 你是銀行 (station 7) ---------------------------------------------
    {
      stationId: 7,
      placement: "station",
      hook: {
        question: "如果你是銀行，最想先知道申請人的哪件事？",
        options: [
          { id: "income", label: "收入多少" },
          { id: "ontime", label: "以前有沒有準時還" },
          { id: "job", label: "做什麼工作" },
        ],
      },
      lessonCards: [
        {
          kind: "text",
          title: "銀行在看什麼",
          // 22 倍: DBR22, docs/redesign/sources.md item 11.
          body: "有沒有穩定收入、每月要還多少、過去準不準時、最近是不是到處借錢、有沒有幫別人擔保。無擔保的借款總額，原則上不超過月收入的 22 倍。",
        },
        {
          kind: "text",
          title: "信用小白",
          // 200 到 800 分, 暫時無法評分: docs/redesign/sources.md item 10.
          body: "從沒用過信用卡或貸款的人，不是信用差，是銀行沒資料可看。信用評分介於 200 到 800 分，資料太少會暫時無法評分。",
        },
      ],
      task: {
        id: "xinyong.bank.v1",
        kind: "xinyong_bank_v1",
        title: "你是銀行",
        brief: {
          role: "星河銀行的放款專員",
          situation: "今天有 6 個人申請貸款或信用卡。看完每份資料，給他們 1、2 或 3 分。",
        },
        materials: reports.map((data) => ({ kind: "creditReport" as const, data })),
        steps: [
          {
            id: "s1",
            type: "rate",
            prompt: "看完每份資料，給 1、2 或 3 分。",
            scale: [
              { value: 1, label: "不核准" },
              { value: 2, label: "小額或要求更多資料" },
              { value: 3, label: "核准" },
            ],
            items: reports.map((r, i) => ({
              id: `f${i + 1}`,
              label: `${r.name}：${r.application}`,
              materialIndex: i,
              ...verdicts[i],
            })),
            drawCount: 6,
            explanation: "一個小細節就能改變答案。翻開每份資料，看看銀行最在意的那一格。",
          },
        ],
        passScore: 0.6,
      },
      reveal: {
        bias: "過度自信",
        default: "當銀行才發現：一個小細節就能改變答案。你看別人的資料這麼仔細，銀行看你的時候也一樣。",
      },
      takeaway: {
        name: "銀行看你的五件事",
        lines: ["收入穩不穩", "每月要還多少", "有沒有準時", "最近有沒有到處借", "有沒有幫人擔保"],
      },
      minutes: 9,
      lifeGameTurn: true,
      doLine: "當一天銀行，審 6 份申請",
    },

    // --- Task C: 朋友要跟你借錢 (library) -----------------------------------------
    {
      stationId: null,
      placement: "library",
      hook: {
        question: "好朋友開口借 NT$5,000，你會借嗎？",
        options: [
          { id: "lend", label: "會借" },
          { id: "ask", label: "先問他要做什麼" },
          { id: "refuse", label: "不借" },
        ],
      },
      lessonCards: [
        {
          kind: "flow",
          title: "借錢兩問",
          steps: ["真的需要嗎？", "他還得起嗎？", "兩個都是：約好什麼時候還。有一個不是：有勇氣說不。"],
        },
      ],
      task: {
        id: "xinyong.friendloan.v1",
        kind: "xinyong_friend_loan_v1",
        title: "朋友要跟你借錢",
        brief: {
          role: "你",
          situation: "同學傳訊息來借錢。",
        },
        materials: [
          {
            kind: "chat",
            data: {
              contact: "阿凱",
              messages: [
                { time: "21:14", from: "them", text: "欸在嗎" },
                { time: "21:14", from: "them", text: "可以先借我 5000 嗎 月底就還你" },
                { time: "21:15", from: "me", text: "怎麼了？" },
                { time: "21:16", from: "them", text: "想買新的球鞋 限量的 今天不買就沒了" },
                { time: "21:16", from: "them", text: "我打工薪水下個月才會進來" },
                { time: "21:17", from: "them", text: "上次跟小傑借的 1500 我還沒還他 但這次一定還你" },
              ],
            },
          },
        ],
        steps: [
          {
            id: "s1",
            type: "find",
            prompt: "找出兩個讓你該猶豫的地方",
            materialIndex: 0,
            targets: ["msg:3", "msg:5"],
            explainTargets: {
              "msg:3": "限量球鞋是想要，不是需要。",
              "msg:5": "上次借的錢還沒還，這是他過去的紀錄。",
            },
            explanation: "一個是想要不是需要，一個是之前借的還沒還。",
          },
          {
            id: "s2",
            type: "choice",
            prompt: "你怎麼回？",
            options: [
              { id: "a", label: "借 5000" },
              { id: "b", label: "借一半" },
              { id: "c", label: "不借，但幫他想辦法" },
              { id: "d", label: "直接已讀不回" },
            ],
            correct: "c",
            reasons: [
              { id: "r1", label: "這不是必要的花費，而且他還有一筆沒還。" },
              { id: "r2", label: "朋友就應該互相幫忙。" },
              { id: "r3", label: "5000 不多，不借很小氣。" },
            ],
            correctReason: "r1",
            explanation: "拒絕不等於不夠朋友。你可以說：『這次我不借，但我可以陪你算算看怎麼存到。』",
          },
          {
            id: "s3",
            type: "choice",
            prompt: "如果他接著說：『那你幫我當分期的保證人就好』？",
            options: [
              { id: "a", label: "答應" },
              { id: "b", label: "拒絕" },
            ],
            correct: "b",
            reasons: [
              { id: "r1", label: "當保證人等於答應他不還時由我來還。" },
              { id: "r2", label: "保證人只是簽個名。" },
              { id: "r3", label: "他是好朋友，不會害我。" },
            ],
            correctReason: "r1",
            explanation: "當保證人等於答應他不還時由我來還。",
          },
        ],
        passScore: 0.6,
      },
      reveal: {
        bias: "怕傷感情",
        default: "我們常常為了不尷尬而借錢。但借出去收不回來，傷的感情更多。",
      },
      takeaway: {
        name: "借錢兩問",
        lines: ["真的需要嗎？", "他還得起嗎？", "兩個都是：約好什麼時候還", "有一個不是：有勇氣說不"],
      },
      minutes: 15,
      lifeGameTurn: true,
      doLine: "看完訊息，決定借不借",
    },

    // --- Task D: 保護你的卡 (terminal) --------------------------------------------
    {
      stationId: null,
      placement: "terminal",
      hook: {
        question: "收到「刷卡失敗，請點連結更新資料」的簡訊，你會點嗎？",
        options: [
          { id: "click", label: "會點" },
          { id: "call", label: "先打給銀行問" },
          { id: "ignore", label: "不理它" },
        ],
      },
      lessonCards: [
        {
          kind: "compare",
          title: "三要三不",
          left: {
            name: "要",
            rows: [
              { label: "保護個資", value: "" },
              { label: "定期對帳", value: "" },
              { label: "小心保管密碼", value: "" },
            ],
          },
          right: {
            name: "不要",
            rows: [
              { label: "點不明連結", value: "" },
              { label: "給別人卡號和驗證碼", value: "" },
              { label: "把卡借別人", value: "" },
            ],
          },
        },
      ],
      task: {
        id: "xinyong.protect.v1",
        kind: "xinyong_protect_card_v1",
        title: "保護你的卡",
        brief: {
          role: "剛拿到信用卡的你",
          situation: "盜刷常常從一個小動作開始。分分看，哪些要做，哪些不要。",
        },
        materials: [],
        steps: [
          {
            id: "s1",
            type: "sort",
            prompt: "把這些習慣分成「要」和「不要」。",
            boxes: [
              { id: "do", label: "要" },
              { id: "dont", label: "不要" },
            ],
            items: [
              { id: "i1", label: "每月對一次帳單", box: "do", explain: "對帳才會發現不是你刷的那一筆。" },
              {
                id: "i2",
                label: "把簡訊驗證碼告訴「銀行客服」",
                box: "dont",
                explain: "真的銀行不會跟你要驗證碼。",
              },
              { id: "i3", label: "密碼用生日", box: "dont", explain: "生日很好猜，別人也查得到。" },
              {
                id: "i4",
                label: "收到「刷卡失敗」簡訊就點連結",
                box: "dont",
                explain: "不明連結不要點，有問題直接打卡片背面的電話。",
              },
              { id: "i5", label: "開啟刷卡通知", box: "do", explain: "每刷一筆就收到通知，被盜刷馬上知道。" },
              { id: "i6", label: "把卡借給室友刷一下", box: "dont", explain: "卡只能本人用，刷了也算在你頭上。" },
              {
                id: "i7",
                label: "卡片遺失馬上打給銀行掛失",
                box: "do",
                explain: "越早掛失，被盜刷的風險越小。",
              },
              { id: "i8", label: "網購只在熟悉的網站", box: "do", explain: "不熟的網站可能是假的，卡號會被拿走。" },
            ],
            explanation: "要：保護個資、定期對帳、小心保管密碼。不要：點不明連結、給別人卡號和驗證碼、把卡借別人。",
          },
        ],
        passScore: 0.6,
      },
      reveal: {
        bias: "習慣",
        default: "大部分盜刷不是駭客多厲害，是我們順手點了一個連結。",
      },
      takeaway: {
        name: "三要三不",
        lines: ["要：保護個資、定期對帳、小心保管密碼", "不要：點不明連結、給別人卡號和驗證碼、把卡借別人"],
      },
      minutes: 15,
      lifeGameTurn: true,
      doLine: "分出保護卡片的好習慣",
    },
  ],
};
