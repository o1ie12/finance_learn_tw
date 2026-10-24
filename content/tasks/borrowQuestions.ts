/**
 * 06 P2 task 8: 借錢之前 (信用線, a 加碼任務). Six debts sorted by what they
 * are for, then a fictional loan offer read for the four things to check
 * before borrowing (amount, term and rate; how the rate can change; early
 * repayment; other fees), then the money actually received, worked out by
 * the engine. The offer and every amount are illustrative (示意).
 */
import { PERSONA } from "../personas";
import type { StationLesson } from "@/lib/tasks/types";

const AMOUNT = 100_000;
const FEE = 6_000;

export const borrowQuestions: StationLesson = {
  stationId: null,
  placement: "library",
  figures: {
    amount: { ref: { fn: "sum", of: [AMOUNT] }, unit: "NT$" },
    fee: { ref: { fn: "sum", of: [FEE] }, unit: "NT$" },
    received: { ref: { fn: "diff", a: AMOUNT, b: FEE }, unit: "NT$" },
  },
  hook: {
    question: "借錢時，你最先看的是哪一項？",
    options: [
      { id: "rate", label: "利率" },
      { id: "monthly", label: "每月要還多少" },
      { id: "fast", label: "多快能拿到錢" },
      { id: "gift", label: "有沒有送禮" },
    ],
  },
  lessonCards: [
    {
      kind: "text",
      title: "借錢之前先分清楚",
      body: "為了未來收入或生活必需的借款，和只為了現在想要的借款不一樣。利率越高、越像為了想要，越要小心。",
    },
    {
      kind: "flow",
      title: "借款前四問",
      steps: ["借多少、借多久、利率多少？", "利率會不會變？怎麼變？", "可以提前還嗎？要付違約金嗎？", "除了利息，還有哪些費用？"],
    },
  ],
  task: {
    id: "xinyong.borrow.v1",
    kind: "xinyong_borrow_v1",
    title: "借錢之前",
    brief: {
      from: PERSONA.xinyong,
      message: "客戶拿著一張貸款傳單來問值不值得辦。幫我把該看的地方找出來。",
      learn: "分清楚借錢的目的，和借款前要問的四件事。",
      do: "把六筆借款分類，在方案裡找出四個重點，再算一個數字。",
      minutes: 9,
    },
    materials: [
      {
        kind: "snapshot",
        data: {
          name: "星河快速貸方案（示意）",
          rows: [
            { label: "方案名稱", value: "星河快速貸" },
            { label: "借款金額與期數", value: "{{amount}}，分 36 期" },
            { label: "年利率", value: "前 3 個月 1.99%，之後依信用評分調整為 8% 到 15%" },
            { label: "提前清償", value: "前 12 個月提前還款，收取剩餘本金 3% 的違約金" },
            { label: "開辦費", value: "{{fee}}，從撥款金額中直接扣除" },
            { label: "撥款速度", value: "最快當天撥款" },
            { label: "申辦禮", value: "申辦就送行動電源" },
          ],
        },
      },
    ],
    steps: [
      {
        id: "s1",
        type: "sort",
        prompt: "這些借款，是為了什麼？",
        boxes: [
          { id: "future", label: "為了未來或生活必需" },
          { id: "want", label: "為了現在想要的東西" },
        ],
        items: [
          { id: "loan", label: "就學貸款", box: "future", explain: "讀書可能讓未來收入變多，利率也比一般貸款低。" },
          { id: "scooter", label: "上班一定要用的機車分期", box: "future", explain: "沒有車就沒辦法上班，是生活必需。" },
          { id: "course", label: "考證照的課程分期", box: "future", explain: "為了未來的工作能力。" },
          { id: "phone", label: "最新款手機分期", box: "want", explain: "舊手機還能用，換新是想要。" },
          { id: "trip", label: "出國旅遊刷卡分期", box: "want", explain: "享受現在，錢要在未來慢慢還。" },
          { id: "shoes", label: "為了買限量球鞋辦信用貸款", box: "want", explain: "為了想要的東西借高利率的錢，最要小心。" },
        ],
        explanation: "同樣是借錢，目的不同。為了未來或必需的借款，也還是要確定還得起。",
      },
      {
        id: "s2",
        type: "find",
        prompt: "點出借款前一定要看的四項。",
        materialIndex: 0,
        targets: ["row:1", "row:2", "row:3", "row:4"],
        explainTargets: {
          "row:1": "借多少、分幾期：決定每月要還多少、總共要還多久。",
          "row:2": "前 3 個月的低利率只是開頭，之後可能變成 8% 到 15%。",
          "row:3": "提前還款要付違約金，想早點還清也要多付錢。",
          "row:4": "開辦費直接從撥款扣掉，實際拿到的錢比借的少。",
        },
        explanation: "金額期數、利率怎麼變、提前還款的限制、其他費用，四項都看完才知道真正的成本。撥款速度和贈品不是重點。",
      },
      {
        id: "s3",
        type: "number",
        prompt: "借 {{amount}}，開辦費 {{fee}} 從撥款扣掉，實際拿到多少？",
        answer: { fn: "diff", a: AMOUNT, b: FEE },
        unit: "NT$",
        explanation: "{{amount}} − {{fee}} = {{received}}。但要還的本金還是 {{amount}}。",
      },
    ],
    passScore: 0.6,
    verifiedOn: "2026-10",
  },
  reveal: {
    bias: "錨定效應",
    byHookOption: {
      gift: "贈品和撥款速度最容易吸引人，卻和要付多少錢無關。先看四個重點，再看其他。",
    },
    default: "只看到前 3 個月的 1.99%，就容易以為很便宜。這叫錨定效應：先看最貴的時候要付多少。",
  },
  takeaway: {
    name: "借款前四問",
    lines: ["借多少、多久、利率多少", "利率會不會變", "能不能提前還", "還有哪些費用"],
  },
  minutes: 9,
  lifeGameTurn: true,
  doLine: "看懂一張貸款方案的四個重點",
};
