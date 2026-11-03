/**
 * 11 LEGAL-2: one date for the privacy policy and the terms, shown on both.
 * Change it, and add a line to LEGAL_CHANGES, on every edit to either page.
 */
export const LEGAL_UPDATED_AT = "2026 年 11 月 3 日";

export const LEGAL_CHANGES: { date: string; page: "privacy" | "terms" | "both"; change: string }[] = [
  { date: "2026-11-03", page: "terms", change: "「三、使用資格」改名為「三、誰可以使用」；「歷史回放投資模擬」加上連結。" },
  { date: "2026-11-03", page: "both", change: "兩頁共用同一個更新日期，並在頁尾列出修改紀錄。" },
  { date: "2026-08", page: "both", change: "第一版。" },
];
