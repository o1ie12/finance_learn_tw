import type { LineSlug } from "@/lib/lines";

/**
 * 轉乘站 (transfer stations) — short (~10 min) content unlocked only once a
 * student has completed both lines it connects. Pure content, no quiz/sim:
 * the payoff is showing the connection between two lines the student has
 * already finished separately, not testing new material.
 */
export interface TransferStation {
  id: string; // URL slug
  title: string;
  lineA: LineSlug;
  lineB: LineSlug;
  body: string; // main paragraph
  fact: string; // 台灣現況
  mistake: string; // 常見錯誤
}

export const TRANSFER_STATIONS: TransferStation[] = [
  {
    id: "jiechian-touzi",
    title: "借錢投資",
    lineA: "xinyong",
    lineB: "touzi",
    body: "用信用卡預借現金或信用貸款去投資，是財務世界最危險的組合之一。投資有虧損可能，但欠銀行的錢一定要還，而且利息通常遠高於投資可能帶來的報酬。如果投資虧了，你拿什麼還這筆貸款？",
    fact: "信用卡預借現金另計手續費，加上循環利率上限 15%，實際成本經常超過 20%，遠高於任何穩健投資工具的長期平均報酬。",
    mistake: "覺得「反正投資報酬一定比貸款利息高」。市場短期波動無法預測，借錢投資把虧損風險放大到超出自己能承受的範圍。",
  },
  {
    id: "yingji-baoxian",
    title: "緊急預備金再思考",
    lineA: "cunqian",
    lineB: "baoxian",
    body: "存錢線教你存 3-6 個月生活費當緊急預備金，保險線教你意外險、醫療險可以轉移一部分意外風險。保險越完整，需要準備的現金緩衝可以相對調整，但保險不能取代所有的緊急預備金，因為理賠有等待期跟除外條款。",
    fact: "用情境比較：有意外險 vs 沒有意外險的人，各自需要準備多少緊急預備金才夠安心，答案並不相同。",
    mistake: "覺得「有保險就不用存緊急預備金」。理賠有申請流程跟等待期，緊急狀況發生當下還是需要現金應急。",
  },
  {
    id: "shipo-touzi-zhapian",
    title: "識破投資詐騙",
    lineA: "zhapian",
    lineB: "touzi",
    body: "詐騙線教你辨識詐騙手法，投資線教你真正的投資邏輯。把兩者結合：用「這個投資機會有沒有保證獲利」「有沒有要求先繳費才能出金」「報酬率是否高到不合理」三個真正的投資知識能判斷的問題，反過來識破詐騙話術。",
    fact: "證交所等單位持續推出反詐宣導內容，核心邏輯都是「越是天上掉下來的好事，越要提高警覺」。",
    mistake: "只看「這個人講的投資名詞我聽不懂，他應該很專業」。真正專業的投資建議會清楚說明風險，而不是用複雜術語掩蓋風險。",
  },
  {
    id: "xuedai-baoshui",
    title: "學貸與報稅",
    lineA: "xuedai",
    lineB: "baoshui",
    body: "開始還學貸之後，學貸利息在某些情況下可以列入報稅的扣除項目。出社會後第一次同時面對「還學貸」跟「報稅」兩件事，兩者其實有連動關係。",
    fact: "相關扣除規定由財政部公告，是否適用及最新規定，實際申報前務必查證。",
    mistake: "報稅時完全沒想到學貸利息可能可以列舉扣除，白白多繳了稅。",
  },
  {
    id: "zujin-baoshui",
    title: "租金列舉扣除實戰",
    lineA: "zuwu",
    lineB: "baoshui",
    body: "把租屋線學到的租客權益，跟報稅線學到的租金扣除額結合，實際操作一次申報流程——從簽約時要注意的條款，到報稅時要準備的文件，是同一件事的兩個階段。",
    fact: "房屋租金支出屬於特別扣除額，上限金額由財政部公告，申報時需要準備租賃契約作為佐證文件。",
    mistake: "忘記跟房東索取或準備租賃契約，等到報稅時才發現沒有佐證文件可以申報租金扣除額。",
  },
  {
    id: "chuangye-baoshui",
    title: "創業登記與稅務",
    lineA: "chuangye",
    lineB: "baoshui",
    body: "創業線教你要辦商業登記，報稅線教你所得怎麼算——把兩條線串起來，看見「開始做生意」到「要繳多少稅」的完整流程，而不是把兩件事分開想。",
    fact: "營利事業所得與個人綜合所得的申報方式不同，規模擴大到需要辦理商業登記時，稅務處理也會跟著改變。",
    mistake: "覺得登記跟報稅是創業成功之後才需要煩惱的事，提早了解能避免規模變大後的補辦麻煩。",
  },
  {
    id: "fuka-zhapian",
    title: "附卡陷阱",
    lineA: "xinyong",
    lineB: "zhapian",
    body: "詐騙集團有時會鎖定附卡持有人（通常是未成年或剛成年的年輕人），假借銀行名義索取卡號、驗證碼。把信用卡運作知識跟詐騙辨識能力結合，才不會因為對方講得出部分卡片資訊就照做。",
    fact: "真銀行不會透過簡訊或電話要求提供完整卡號或 OTP 驗證碼——這條規則同時是信用卡安全用卡的基本常識，也是辨識詐騙的關鍵判準。",
    mistake: "收到「銀行」簡訊要求提供卡號或簡訊驗證碼就照做。",
  },
];

export function getTransferStation(id: string): TransferStation | undefined {
  return TRANSFER_STATIONS.find((t) => t.id === id);
}

/** Transfer stations connecting a given line, for listing on its detail page. */
export function transferStationsForLine(slug: LineSlug): TransferStation[] {
  return TRANSFER_STATIONS.filter((t) => t.lineA === slug || t.lineB === slug);
}
