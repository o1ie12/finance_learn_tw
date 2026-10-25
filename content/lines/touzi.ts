/**
 * 投資線 content (04-CONTENT §7). Placement: Task A → station 5, Task B →
 * station 8, Task C → terminal.
 *
 * Sources:
 * - Card interest cap 15%: already verified in the repo (04 §15 footer;
 *   lib/creditCard.ts).
 * - ETF codes and suffix meanings: docs/redesign/sources.md item 12 (TWSE
 *   product pages). 00982B holds USD bonds, so the bond example is
 *   00679B 元大美債20年. The letter card stays date-free.
 * - Task C prices: real split-adjusted 0050 monthly closes from SEED_ROWS,
 *   picked by code (`source.window: "biggestFall12"`); {pct} is filled by code.
 * - 小安 / 阿德 / 美美 are fictional; their figures are 04's scenario.
 */

import { guaranteedPitch } from "../tasks/guaranteedPitch";
import { riskTolerance } from "../tasks/riskTolerance";
import { PERSONA } from "../personas";
import type { LineContent, StationLesson, Takeaway } from "@/lib/tasks/types";

const READY_STEPS = [
  "留好 3 到 12 個月的緊急預備金",
  "先還掉高利息的債",
  "存錢是投資的本",
  "沒想清楚之前，不借錢投資",
];

const takeawayLine: Takeaway = {
  name: "先管好錢，再讓錢長大",
  lines: READY_STEPS,
};

const revealRush = {
  bias: "急著讓錢變多",
  default:
    "看到別人投資賺錢，人會急著跳過前面的步驟。但底下沒打穩，一次意外就會被迫在低點賣掉。",
};

// --- Task A: 準備好了嗎 --------------------------------------------------------

const taskA: StationLesson = {
  stationId: 5,
  placement: "station",
  hook: {
    question: "股市一個月跌了 10%，你手上的 ETF 要賣嗎？",
    options: [
      { id: "sell", label: "賣掉" },
      { id: "hold", label: "不動" },
      { id: "buy", label: "再買一些" },
    ],
  },
  figures: {
    r3: { ref: { fn: "realValue", amount: 100, inflation: 0.03, years: 15 }, unit: "NT$", digits: 1 },
    r4: { ref: { fn: "realValue", amount: 100, inflation: 0.04, years: 15 }, unit: "NT$", digits: 1 },
  },
  lessonCards: [
    {
      kind: "text",
      title: "投資是冰山的頂端",
      body: "水面上是投資，水面下是預算、存款和緊急預備金。沒有這些就急著投資，常常不是理財，是賭。",
    },
    { kind: "flow", title: "進場前四件事", steps: READY_STEPS },
    {
      kind: "text",
      title: "通膨會吃掉錢",
      // 06 section 3 item 1: computed as amount ÷ (1 + i)^n (lib/tasks/compute.ts realValue).
      body: "物價每年漲 3%，今天的 NT$100，15 年後只買得到現在 {{r3}} 的東西；每年漲 4%，只剩 {{r4}}（示意）。",
    },
  ],
  task: {
    id: "touzi.ready.v1",
    kind: "touzi_ready_v1",
    title: "準備好了嗎",
    brief: {
          from: PERSONA.touzi,
          message: "三個朋友都說想開始投資。先看看他們的狀況，誰準備好了？",
          learn: "開始投資之前要先準備好什麼。",
          do: "看三個人的狀況，選出準備好的人。",
          minutes: 6,
        },
    materials: [
      {
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
      {
        kind: "snapshot",
        data: {
          name: "阿德",
          rows: [
            { label: "存款", value: "NT$80,000" },
            { label: "卡債", value: "NT$25,000（循環中）" },
          ],
        },
      },
      {
        kind: "snapshot",
        data: {
          name: "美美",
          rows: [
            { label: "存款", value: "NT$8,000" },
            { label: "每月必要開銷", value: "NT$16,000" },
            { label: "卡債", value: "NT$0" },
          ],
        },
      },
    ],
    steps: [
      {
        id: "s1",
        type: "choice",
        prompt: "誰最適合開始每月投資一點？",
        options: [
          { id: "a", label: "小安" },
          {
            id: "b",
            label: "阿德",
            // 15% is the legal cap on card interest, so 阿德's rate can be lower.
            explain: "卡債年利率最高到 15%，先還卡債，等於穩穩賺到這個利率。",
          },
          {
            id: "c",
            label: "美美",
            explain: "美美的存款還不到一個月的開銷，先存好緊急預備金。",
          },
        ],
        correct: "a",
        reasons: [
          { id: "r1", label: "有三個多月的預備金，也沒有高利息的債。" },
          { id: "r2", label: "阿德存款最多。" },
          { id: "r3", label: "美美最需要讓錢變多。" },
        ],
        correctReason: "r1",
        explanation: "小安有三個多月的預備金，也沒有高利息的債。",
      },
    ],
    passScore: 0.6,
  },
  reveal: revealRush,
  takeaway: takeawayLine,
  minutes: 12,
  lifeGameTurn: true,
  doLine: "看三個人的狀況，選出誰準備好了",
};

// --- Task B: 看懂 ETF 代號 -----------------------------------------------------

const taskB: StationLesson = {
  stationId: null,
  placement: "terminal",
  hook: {
    question: "ETF 代號最後多了一個英文字母，你會注意嗎？",
    options: [
      { id: "notice", label: "會" },
      { id: "ignore", label: "不會" },
      { id: "unknown", label: "不知道那代表什麼" },
    ],
  },
  lessonCards: [
    {
      kind: "text",
      title: "代號最後的英文字母",
      body: "ETF 代號最後的英文字母代表類型。L、R、U、B 已經用了很多年；A 是近年才有的主動式 ETF。像 0050 這樣沒有字母的，是一般的股票型 ETF。",
    },
  ],
  task: {
    id: "touzi.etfcode.v1",
    kind: "touzi_etfcode_v1",
    title: "看懂 ETF 代號",
    brief: {
          from: PERSONA.touzi,
          message: "ETF 代號後面的英文字母都有意思。先弄懂，再決定買哪一檔。",
          learn: "ETF 代號裡的字母代表什麼。",
          do: "把代號分類，再回答兩題。",
          minutes: 8,
        },
    materials: [],
    steps: [
      {
        id: "s1",
        type: "sort",
        prompt: "把每個代號放進它的類型。",
        boxes: [
          { id: "passive", label: "一般股票型（被動）" },
          { id: "active", label: "主動式股票型" },
          { id: "bond", label: "債券型" },
          { id: "leveraged", label: "槓桿型" },
          { id: "inverse", label: "反向型" },
          { id: "futures", label: "期貨型" },
        ],
        // sources.md item 12: TWSE product pages.
        items: [
          { id: "0050", label: "0050", box: "passive", explain: "0050 元大台灣50：沒有字母，一般股票型。" },
          { id: "00980A", label: "00980A", box: "active", explain: "00980A 主動野村臺灣優選：A 是主動式股票 ETF。" },
          { id: "00679B", label: "00679B", box: "bond", explain: "00679B 元大美債20年：B 是債券 ETF。" },
          { id: "00631L", label: "00631L", box: "leveraged", explain: "00631L 元大台灣50正2：L 是槓桿型。" },
          { id: "00632R", label: "00632R", box: "inverse", explain: "00632R 元大台灣50反1：R 是反向型。" },
          { id: "00642U", label: "00642U", box: "futures", explain: "00642U 期元大S&P石油：U 是期貨 ETF。" },
        ],
        explanation: "看最後一個英文字母：A 主動式、B 債券、L 槓桿、R 反向、U 期貨。沒有字母的，是一般股票型。",
      },
      {
        id: "s2",
        type: "choice",
        prompt: "哪兩種不適合長期放著不管？",
        options: [
          { id: "a", label: "L 和 R" },
          { id: "b", label: "A 和 B" },
          { id: "c", label: "0050 和 B" },
        ],
        correct: "a",
        explanation: "槓桿和反向追的是『每天』的倍數，放久了會跟指數走不一樣。",
      },
      {
        id: "s3",
        type: "choice",
        prompt: "為什麼這門課用大盤 ETF 當例子，不是黃金或加密貨幣？",
        options: [
          { id: "a", label: "大盤 ETF 擁有很多會賺錢的公司" },
          { id: "b", label: "黃金和加密貨幣一定會賠" },
          { id: "c", label: "大盤 ETF 保證賺" },
        ],
        correct: "a",
        reasons: [
          { id: "r1", label: "公司會賺錢、發股利；黃金不會產生收入，加密貨幣波動很大，詐騙也多。" },
          { id: "r2", label: "因為大盤不會跌。" },
          { id: "r3", label: "因為老師說的。" },
        ],
        correctReason: "r1",
        explanation:
          "公司會賺錢、發股利；黃金不會產生收入，加密貨幣波動很大，詐騙也多。這不代表黃金或加密貨幣一定不好，只是風險和道理不同，新手先從看得懂的開始。",
      },
    ],
    passScore: 0.6,
  },
  reveal: revealRush,
  takeaway: {
    name: "L 和 R 不長抱",
    lines: ["槓桿和反向追的是『每天』的倍數，放久了會跟指數走不一樣。"],
  },
  minutes: 15,
  lifeGameTurn: true,
  doLine: "把 ETF 代號配對到類型",
};

// --- Task C: 真實的暴跌月 (terminal) -------------------------------------------

const taskC: StationLesson = {
  stationId: 8,
  placement: "station",
  hook: {
    question: "看到新聞說台股大跌，你第一個反應是什麼？",
    options: [
      { id: "check", label: "馬上打開 App 看" },
      { id: "wait", label: "先不管它" },
      { id: "ask", label: "問身邊的人怎麼辦" },
    ],
  },
  lessonCards: [
    {
      kind: "text",
      title: "帳面虧損是什麼",
      body: "價格跌了，你的帳面就少了。還沒賣，虧損就還只是帳面上的數字。",
    },
  ],
  task: {
    id: "touzi.crash.v1",
    kind: "touzi_crash_v1",
    title: "真實的暴跌月",
    brief: {
          from: PERSONA.touzi,
          message: "你每月定期定額大盤 ETF，已經投入 NT$50,000。這個月台股大跌，你會怎麼做？",
          learn: "大跌時為什麼不要急著賣。",
          do: "看真實的一個月，做一個決定。",
          minutes: 6,
        },
    materials: [
      {
        kind: "priceChart",
        // Real 0050 closes; code fills the series and the drop month.
        data: {
          title: "0050 每月收盤價（12 個月）",
          series: [],
          source: { ticker: "0050", window: "biggestFall12" },
        },
      },
      {
        kind: "newsCard",
        data: {
          headline: "台股單月重挫 {pct}%",
          body: "新聞說台股這個月大跌，很多人在討論要不要先賣。",
          dateLabel: "這個月",
        },
      },
    ],
    steps: [
      {
        id: "s1",
        type: "choice",
        prompt: "你要怎麼做？",
        options: [
          { id: "sell", label: "全部賣掉，先保住剩下的" },
          { id: "hold", label: "繼續定期定額" },
          {
            id: "add",
            label: "用緊急預備金加碼",
            explain: "緊急預備金是給意外用的，不是給投資用的。",
          },
        ],
        correct: "hold",
        reasons: [
          { id: "r1", label: "長期投資本來就會遇到大跌，賣掉就把帳面虧損變成真的虧損。" },
          { id: "r2", label: "先賣掉，等漲回來再買。" },
          { id: "r3", label: "跌越多越要把所有錢都放進去。" },
        ],
        correctReason: "r1",
        explanation: "長期投資本來就會遇到大跌，賣掉就把帳面虧損變成真的虧損。",
      },
    ],
    passScore: 0.6,
    afterTip: "下面是大跌之後真實的六個月。漲回來或沒漲回來，這裡都照實給你看。",
  },
  reveal: {
    bias: "損失趨避",
    outcomeFrom: { stepId: "s1", map: { sell: "sold", hold: "held", add: "added" } },
    byOutcome: {
      sold: "賠錢的痛，大約是賺錢快樂的兩倍，所以大跌時人會想逃。這叫損失趨避。",
      // 04 said 「之後就錯過了回升」; the data may not recover (04 §7C), so conditional.
      held: "你撐住了。很多人在這種月份賣掉，之後如果回升，就錯過了。",
      added: "想撿便宜很正常，但不能動到預備金。",
    },
    default: "大跌的時候，最難的不是算數學，是管住自己的害怕。",
  },
  takeaway: {
    name: "大跌時三不",
    lines: ["不恐慌賣", "不動預備金", "不借錢加碼"],
  },
  minutes: 9,
  lifeGameTurn: true,
  doLine: "遇到真實的暴跌月，決定怎麼做",
};

export const content: LineContent = {
  slug: "touzi",
  hook: taskA.hook,
  bias: "損失趨避、怕錯過、從眾",
  takeaway: takeawayLine,
  unlocks: "ETF 買賣、定期定額、賣出、快轉",
  lessons: [taskA, taskB, taskC, riskTolerance, guaranteedPitch],
};
