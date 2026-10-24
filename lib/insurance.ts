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
