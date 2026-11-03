/**
 * 11 VERIFY-1: primary sources for the numbers on the public pages, shown in
 * small text under each claim. A number a student might repeat to a parent
 * or a teacher has an entry here (tests/claims.test.ts holds the landing to
 * it). Checked 2026-11-03 on 全國法規資料庫 (法務部).
 */
export interface Source {
  title: string;
  issuer: string;
  url: string;
  checkedOn: string;
  /** What the source says that the claim rests on, in one line. */
  note: string;
}

export const SOURCES = {
  securitiesTax: {
    title: "證券交易稅條例 第 2 條",
    issuer: "全國法規資料庫（法務部）",
    url: "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=G0340078&flno=2",
    checkedOn: "2026-11-03",
    note: "股票千分之三；公司債及其他經政府核准之有價證券（含 ETF 受益憑證）千分之一。以債券為主的 ETF 停徵到 2026-12-31。",
  },
  capitalGains: {
    title: "所得稅法 第 4 條之 1",
    issuer: "全國法規資料庫（法務部）",
    url: "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=G0340003&flno=4-1",
    checkedOn: "2026-11-03",
    note: "自 1990 年 1 月 1 日起，證券交易所得停止課徵所得稅，損失也不能扣除。",
  },
  pension: {
    title: "勞工退休金條例 第 14 條",
    issuer: "全國法規資料庫（法務部）",
    url: "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=N0030020&flno=14",
    checkedOn: "2026-11-03",
    note: "雇主提繳的退休金，不得低於勞工每月工資百分之六。",
  },
  healthInsurance: {
    title: "全民健康保險法 第 27 條",
    issuer: "全國法規資料庫（法務部）",
    url: "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=L0060001&flno=27",
    checkedOn: "2026-11-03",
    note: "受僱者的保費由本人、投保單位和政府分攤（例如本人 30%、投保單位 60%、政府 10%）。",
  },
  revolvingCap: {
    title: "銀行法 第 47 條之 1",
    issuer: "全國法規資料庫（法務部）",
    url: "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=G0380001&flno=47-1",
    checkedOn: "2026-11-03",
    note: "自 2015 年 9 月 1 日起，信用卡循環信用利率不得超過年利率 15%。",
  },
} satisfies Record<string, Source>;

export type SourceId = keyof typeof SOURCES;
