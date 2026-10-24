/**
 * 06 P2 task 6: 風險承受度與分散 (投資線 Task D, a 加碼任務). Three people,
 * then the instruments sorted by how they move, then one diversification
 * question. The rule shown first: 「錢什麼時候要用」 decides. The people and
 * the amount are illustrative (示意); no return is promised. The deposit
 * line rests on VERIFIED.md item 1 (存款保險 covers deposits, not funds,
 * stocks, ETFs or crypto).
 */
import { PERSONA } from "../personas";
import type { StationLesson } from "@/lib/tasks/types";

export const riskTolerance: StationLesson = {
  stationId: null,
  placement: "library",
  hook: {
    question: "投資最重要的，是挑到會漲的東西嗎？",
    options: [
      { id: "yes", label: "是" },
      { id: "no", label: "不是" },
      { id: "unsure", label: "不確定" },
    ],
  },
  lessonCards: [
    {
      kind: "text",
      title: "先問：錢什麼時候要用？",
      body: "一年內要用的錢，放在本金不會跌的地方；十年以上不會動的錢，才適合承受漲跌。",
    },
    {
      kind: "text",
      title: "不要放在同一個籃子",
      body: "一家公司可能出事，很多家同時出事的機會小得多。分散能降低單一公司的風險，但不能消除整個市場的漲跌。",
    },
  ],
  task: {
    id: "touzi.risk.v1",
    kind: "touzi_risk_v1",
    title: "誰能冒多少險",
    brief: {
      from: PERSONA.touzi,
      message: "三位客戶都想投資。幫我看看誰的錢能承受漲跌，再把工具分類。",
      learn: "錢什麼時候要用，決定能冒多少險。",
      do: "選出一個人，把七種工具分類，再回答一題。",
      minutes: 8,
    },
    materials: [
      {
        kind: "snapshot",
        data: {
          name: "三位客戶（示意）",
          rows: [
            { label: "阿哲，17 歲", value: "存零用錢，半年後要買筆電" },
            { label: "小琪，25 歲", value: "月薪穩定，存的是 40 年後的退休金" },
            { label: "阿凱，30 歲", value: "收入不固定，明年要付房子的頭期款" },
          ],
        },
      },
    ],
    steps: [
      {
        id: "s1",
        type: "choice",
        prompt: "誰的錢最能承受價格上下波動？",
        options: [
          { id: "zhe", label: "阿哲", explain: "半年後就要用，跌了沒有時間等它回來。" },
          { id: "qi", label: "小琪" },
          { id: "kai", label: "阿凱", explain: "明年就要用，收入又不固定，跌了會付不出頭期款。" },
        ],
        correct: "qi",
        explanation: "小琪的錢 40 年後才用，收入也穩定，中間跌了還有時間等。錢越快要用，越不能冒險。",
      },
      {
        id: "s2",
        type: "sort",
        prompt: "把每種工具放進最符合它的格子。",
        boxes: [
          { id: "safe", label: "本金不會跌" },
          { id: "spread", label: "會漲跌，但分散" },
          { id: "wild", label: "波動很大，或可能虧超過本金" },
        ],
        items: [
          { id: "demand", label: "活期存款", box: "safe", explain: "隨時可以領，有存款保險。" },
          { id: "time", label: "定期存款", box: "safe", explain: "本金不會跌，有存款保險；提前解約利息會變少。" },
          { id: "bondEtf", label: "債券 ETF", box: "spread", explain: "一次持有很多債券，價格會隨利率變動。ETF 不是存款，沒有存款保險。" },
          { id: "broadEtf", label: "大盤 ETF", box: "spread", explain: "一次買很多家公司，分散了單一公司的風險，但整個市場還是會漲跌。" },
          { id: "stock", label: "單一公司的股票", box: "wild", explain: "所有的錢押在一家公司，它出事時股價可能大跌。" },
          { id: "crypto", label: "加密貨幣", box: "wild", explain: "價格可能在短時間大漲大跌，也沒有存款保險。" },
          { id: "futures", label: "期貨", box: "wild", explain: "用保證金交易，虧損可能超過投入的錢。" },
        ],
        explanation: "這是一種分法：先看本金會不會跌，再看有沒有分散。越往右，越只適合很久都不會用到的錢。",
      },
      {
        id: "s3",
        type: "choice",
        prompt: "小琪想投資 NT$10,000（示意），哪一種最分散風險？",
        options: [
          { id: "one", label: "全部買一家熱門公司的股票", explain: "所有的錢都在同一家公司，一點也不分散。" },
          { id: "crypto", label: "全部買一種加密貨幣", explain: "只有一種資產，波動又很大。" },
          { id: "etf", label: "買一檔追蹤大盤的 ETF" },
          { id: "futures", label: "跟朋友合買期貨", explain: "期貨用保證金交易，可能虧超過本金。" },
        ],
        correct: "etf",
        explanation: "大盤 ETF 一次買進很多家公司，一家出事影響小。市場整體還是會漲跌，所以要用長期不會動到的錢。",
      },
    ],
    passScore: 0.6,
    verifiedOn: "2026-10",
    sources: [{ label: "中央存款保險公司：存款保險常見問答", url: "https://www.cdic.gov.tw/main_deposit/faq.aspx?uid=59&pid=59" }],
  },
  reveal: {
    bias: "過度自信",
    default: "很多人以為自己挑得到會漲的東西，或以為短期內不會跌。這叫過度自信：先看錢什麼時候要用，再看能冒多少險。",
  },
  takeaway: {
    name: "投資前兩問",
    lines: ["錢什麼時候要用？", "有沒有分散？"],
  },
  minutes: 8,
  lifeGameTurn: true,
  doLine: "看錢什麼時候要用，決定能冒多少險",
};
