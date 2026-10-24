/**
 * 06 P2 task 7: 「保本高報酬」 (投資線 Task E, a 加碼任務). A chat pitch
 * promises 8% a year, guaranteed, principal-protected and withdrawable any
 * time; the student finds the claims that cannot all be true, then compares
 * them with the repo's verified 定存 rate. The reveal ties to 詐騙線 case 3
 * (the investment-group scam). The pitch and its sender are fictional.
 */
import { PERSONA } from "../personas";
import type { StationLesson } from "@/lib/tasks/types";

export const guaranteedPitch: StationLesson = {
  stationId: null,
  placement: "library",
  figures: {
    depRate: { ref: { fn: "repoRate", of: "timeDeposit1y" }, unit: "%", digits: 1 },
  },
  hook: {
    question: "有人說「保證年報酬 8%，還隨時可以領回」，你會怎麼想？",
    options: [
      { id: "good", label: "聽起來不錯" },
      { id: "doubt", label: "有點可疑" },
      { id: "scam", label: "一定是詐騙" },
    ],
  },
  lessonCards: [
    {
      kind: "text",
      title: "報酬和風險是一對",
      body: "報酬越高，通常風險越高。本金不會跌、又隨時能領的錢，像定存，年利率只有 {{depRate}} 左右。",
    },
    {
      kind: "text",
      title: "三個不會一起出現的詞",
      body: "「保證」「保本」「高報酬」同時出現，幾乎可以確定有問題。真正的投資，都會寫清楚可能虧損。",
    },
  ],
  task: {
    id: "touzi.pitch.v1",
    kind: "touzi_pitch_v1",
    title: "好得不像真的",
    brief: {
      from: PERSONA.touzi,
      message: "有客戶收到一則理財訊息，想問能不能投。幫我看看哪裡不對。",
      learn: "報酬和風險的關係，和「保本高報酬」為什麼不可能。",
      do: "在訊息裡找出不可能的說法，再做兩個決定。",
      minutes: 7,
    },
    materials: [
      {
        kind: "chat",
        data: {
          contact: "理財達人 Leo（虛構）",
          messages: [
            { time: "20:01", from: "them", text: "你好！看你最近在研究投資，有一個很棒的方案想分享。" },
            { time: "20:01", from: "them", text: "專案保證年報酬 8%，本金百分之百保本。" },
            { time: "20:02", from: "them", text: "而且隨時可以領回，沒有任何限制。" },
            { time: "20:02", from: "them", text: "名額只剩 3 個，今天匯款就幫你保留。" },
            { time: "20:05", from: "me", text: "可以給我公司的資料嗎？" },
            { time: "20:06", from: "them", text: "加我私人帳號聊就好，正式文件不方便給。" },
          ],
        },
      },
    ],
    steps: [
      {
        id: "s1",
        type: "find",
        prompt: "點出不可能同時成立的說法。",
        materialIndex: 0,
        targets: ["msg:1", "msg:2"],
        explainTargets: {
          "msg:1": "保證高報酬又保本：報酬越高風險越高，沒有人能保證。",
          "msg:2": "隨時領回又保證高報酬：連定存提前解約都會少拿利息。",
        },
        explanation: "保證 8%、保本、隨時領回，三件事不會同時成立。催你今天匯款、不給正式文件，也是警訊。",
      },
      {
        id: "s2",
        type: "choice",
        prompt: "為什麼這三件事不會同時成立？",
        options: [
          { id: "tradeoff", label: "報酬越高風險越高；本金不會跌又隨時能領的定存，年利率只有 {{depRate}} 左右" },
          { id: "new", label: "因為這是新方案，還沒有人試過", explain: "問題不在新不新，在於報酬和風險不可能同時都好。" },
          { id: "small", label: "因為 8% 太少了", explain: "8% 本身不算離譜，離譜的是同時保證、保本又隨時能領。" },
        ],
        correct: "tradeoff",
        explanation: "能保本又隨時領的錢，報酬就很低；想要高報酬，就要承擔虧損的可能。",
      },
      {
        id: "s3",
        type: "choice",
        prompt: "收到這種訊息，先做什麼？",
        options: [
          { id: "call", label: "不匯款，打 165 反詐騙專線查證" },
          { id: "small", label: "先匯一點點試試看", explain: "詐騙常先讓你小賺，再引你投入更多。" },
          { id: "ask", label: "請對方傳更多投資成功的截圖", explain: "截圖很容易造假，不能證明什麼。" },
        ],
        correct: "call",
        explanation: "不匯款、不給個資，打 165 查證。跟詐騙線的投資群組案件是同一套說法。",
      },
    ],
    passScore: 0.6,
    verifiedOn: "2026-10",
    sources: [
      { label: "臺灣銀行 新臺幣存款牌告利率（一年期定存）", url: "https://rate.bot.com.tw/twd?Lang=zh-TW" },
      { label: "內政部警政署 165 全民防騙網", url: "https://165.npa.gov.tw/" },
    ],
  },
  reveal: {
    bias: "過度樂觀",
    byHookOption: {
      good: "高報酬讓人只看到好處，忽略不可能的地方。這叫過度樂觀：好得不像真的，通常就不是真的。",
    },
    default: "你已經有警覺。記住這個模式：保證、保本、高報酬、催你快匯款，同時出現就是警訊。",
  },
  takeaway: {
    name: "好得不像真的",
    lines: ["保證、保本、高報酬，不會一起出現", "催你快匯款，先停下來", "打 165 查證"],
  },
  minutes: 7,
  lifeGameTurn: true,
  doLine: "看穿「保本高報酬」的說法",
};
