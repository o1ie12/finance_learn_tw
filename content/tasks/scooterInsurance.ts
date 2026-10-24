/**
 * 06 P1 task 5: 機車保險三層 (保險線, a 加碼任務). One crash; each loss goes to
 * the layer that pays it, or to "his car insurance does not pay". The layers
 * and the 強制險 amounts are VERIFIED.md item 6 (law and FSC pages, checked
 * 2026-10-24); the crash and its costs are illustrative (示意).
 */
import { PERSONA } from "../personas";
import type { StationLesson } from "@/lib/tasks/types";

export const scooterInsurance: StationLesson = {
  stationId: null,
  placement: "library",
  figures: {
    medCap: { ref: { fn: "insuranceCap", of: "medical" }, unit: "NT$" },
    deathCap: { ref: { fn: "insuranceCap", of: "death" }, unit: "NT$" },
  },
  hook: {
    question: "騎車出了車禍，有保強制險，就什麼都會賠嗎？",
    options: [
      { id: "yes", label: "會" },
      { id: "no", label: "不會" },
      { id: "unsure", label: "不確定" },
    ],
  },
  lessonCards: [
    {
      kind: "flow",
      title: "機車保險三層",
      steps: ["強制險：法律規定一定要保，賠被你撞傷的人", "第三人責任險：自己加保，賠更多的傷和別人的東西", "車體險、竊盜險、傷害險：保你自己"],
    },
    {
      kind: "text",
      title: "強制險賠多少",
      body: "每位受害人醫療最多 {{medCap}}，死亡最多 {{deathCap}}（115 年 7 月起）。它不賠任何車和東西。",
    },
  ],
  task: {
    id: "baoxian.scooter.v1",
    kind: "baoxian_scooter_v1",
    title: "機車保險三層",
    brief: {
      from: PERSONA.baoxian,
      message: "小凱騎車撞到人，也撞壞了東西。幫我看看每一筆損失，是哪一種保險在賠。",
      learn: "機車保險分三層，每一層賠什麼。",
      do: "把每筆損失放進對的保險，再回答一題。",
      minutes: 8,
    },
    materials: [
      {
        kind: "snapshot",
        data: {
          name: "這場車禍（示意）",
          rows: [
            { label: "發生什麼事", value: "小凱騎機車，在路口撞到走路的王先生，又擦到路邊停著的汽車" },
            { label: "王先生", value: "受傷住院，醫藥費 NT$260,000；手機摔壞 NT$15,000" },
            { label: "路邊的汽車", value: "車門刮傷，修理 NT$8,000" },
            { label: "小凱", value: "自己的機車要修 NT$12,000，自己也受了傷" },
            { label: "小凱有的保險", value: "強制險、第三人責任險（體傷和財損都有）。沒有車體險和傷害險" },
          ],
        },
      },
    ],
    steps: [
      {
        id: "s1",
        type: "sort",
        prompt: "每一筆損失，是哪一種保險在賠？",
        boxes: [
          { id: "mandatory", label: "強制險" },
          { id: "thirdParty", label: "第三人責任險" },
          { id: "none", label: "他買的車險都不賠" },
        ],
        items: [
          { id: "med", label: "王先生的醫藥費（前 {{medCap}}）", box: "mandatory", explain: "強制險賠被撞到的人，醫療每人最多 {{medCap}}，不管誰的錯。" },
          { id: "medOver", label: "王先生醫藥費超過 {{medCap}} 的部分", box: "thirdParty", explain: "超過強制險上限的傷，由第三人責任險的體傷保額來賠。" },
          { id: "phone", label: "王先生摔壞的手機", box: "thirdParty", explain: "強制險不賠東西。別人的財物損失，由第三人責任險的財損來賠。" },
          { id: "car", label: "路邊汽車的刮傷", box: "thirdParty", explain: "別人的車也是財物，由第三人責任險的財損來賠。" },
          { id: "ownBike", label: "小凱自己機車的修理費", box: "none", explain: "自己的車要買車體險才有賠，小凱沒有買。" },
          { id: "ownInjury", label: "小凱自己的醫藥費", box: "none", explain: "強制險不賠自己的駕駛。健保會付一部分醫療費，想要更多保障，要另外買傷害險。" },
        ],
        explanation: "強制險賠被撞到的人；第三人責任險賠更多的傷和別人的東西；自己的車和自己的傷，要另外買保險。",
      },
      {
        id: "s2",
        type: "choice",
        prompt: "強制險為什麼賠了王先生，卻不賠小凱自己？",
        options: [
          { id: "victim", label: "強制險保的是被撞到的人（乘客和車外的人），不是騎車的自己" },
          { id: "speed", label: "因為小凱騎太快", explain: "強制險不論誰的錯都賠受害人；問題不在速度。" },
          { id: "car", label: "因為強制險只保汽車", explain: "機車也一定要保強制險。" },
          { id: "unpaid", label: "因為小凱沒有繳保費", explain: "小凱有保，只是強制險本來就不賠自己。" },
        ],
        correct: "victim",
        explanation: "強制險賠的是車禍裡受傷的乘客和車外的人，騎車的人自己不算受害人。想保自己，要另外買傷害險。",
      },
    ],
    passScore: 0.6,
    verifiedOn: "2026-10",
    sources: [
      { label: "強制汽車責任保險法", url: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=G0390060" },
      { label: "強制汽車責任保險給付標準（115 年 5 月 29 日修正）", url: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=G0390067" },
      { label: "金管會：單一事故駕駛人強制車險不賠", url: "https://www.fsc.gov.tw/ch/home.jsp?id=96&parentpath=0,2&mcustomize=news_view.jsp&dataserno=201203060004&dtable=News" },
      { label: "自用汽車保險定型化契約範本", url: "https://law.fsc.gov.tw/LawContent.aspx?id=FL047990" },
    ],
  },
  reveal: {
    bias: "樂觀偏誤",
    default: "很多人以為有保險就全包，或事故不會輪到自己。這叫樂觀偏誤：先弄懂每一層保什麼，才知道還缺什麼。",
  },
  takeaway: {
    name: "機車保險三層",
    lines: ["強制險：賠被撞的人", "第三人責任險：賠更多的傷和別人的東西", "車體險、竊盜險、傷害險：保自己"],
  },
  minutes: 8,
  lifeGameTurn: true,
  doLine: "看懂機車保險每一層賠什麼",
};
