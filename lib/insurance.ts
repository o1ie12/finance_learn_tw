/**
 * 強制汽車責任保險 (mandatory auto and scooter cover) amounts per victim,
 * in force from 115/7/1 (2026-07-01).
 * Source: 強制汽車責任保險給付標準 (amended 115/5/29),
 * https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=G0390067, and the FSC's
 * 2026-05-28 release. Checked 2026-10-24 (docs/finline-redesign/VERIFIED.md
 * item 6). Do not use the older NT$2,000,000 figure.
 */
export const MANDATORY_AUTO_INSURANCE = {
  medicalPerVictim: 200_000,
  deathPerVictim: 3_000_000,
  inForceFrom: "2026-07-01",
} as const;

/**
 * 存款保險: each depositor, at one insured institution, principal and interest
 * together, NT$ and foreign-currency deposits combined. The amount is set by
 * the regulators, not written in the statute (存款保險條例 §13).
 * Source: CDIC FAQ Q7, https://www.cdic.gov.tw/main_deposit/faq.aspx?uid=59&pid=59,
 * checked 2026-10-24 (docs/finline-redesign/VERIFIED.md item 1).
 */
export const DEPOSIT_INSURANCE_CAP = 3_000_000;

/**
 * 聯徵中心 personal credit report: one free copy a year online and one on
 * paper, counted separately; after that NT$80 online, NT$100 on paper
 * (Chinese). Online needs age 18.
 * Source: https://www.jcic.org.tw/main_ch/docDetail.aspx?uid=451&pid=168&docid=474
 * (2025-03-27), checked 2026-10-24 (VERIFIED.md item 2).
 */
export const CREDIT_REPORT = { onlineFee: 80, paperFee: 100, onlineMinAge: 18 } as const;
