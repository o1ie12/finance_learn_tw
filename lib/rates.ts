/**
 * Deposit and price-level figures shared by stations and simulations.
 *
 * One definition per figure, read everywhere it appears, so a station and a
 * simulation can never quote two different "定存 rates" again (station 3 said
 * 「大約 1.5%」 while both simulations used 1.6%).
 */

/**
 * 臺灣銀行 新臺幣 一年期定期存款 牌告固定利率 (一般), 1.700% on 2026-10-06.
 * Source: https://rate.bot.com.tw/twd?Lang=zh-TW (牌告日期 2026/10/06).
 * Update the rate and the date together.
 */
export const TIME_DEPOSIT_1Y = {
  rate: 0.017,
  asOf: "2026-10-06",
  asOfLabel: "2026 年 10 月 6 日",
  bank: "臺灣銀行",
} as const;

/**
 * 臺灣銀行 新臺幣 活期儲蓄存款 牌告利率, 0.825% on 2026-10-06 (in effect since
 * 2024-08-01). Source: https://rate.bot.com.tw/twd?Lang=zh-TW. 活期存款 (the
 * non-savings demand account) is 0.705%; the savings simulation's "銀行活存" is
 * the 活期儲蓄 account a student would open.
 */
export const DEMAND_SAVINGS = {
  rate: 0.00825,
  asOf: "2026-10-06",
  asOfLabel: "2026 年 10 月 6 日",
  bank: "臺灣銀行",
} as const;

/**
 * 消費者物價指數 (CPI) 年增率, 行政院主計總處.
 * 2024 (113年) +2.18%: https://www.dgbas.gov.tw/News_Content.aspx?n=3602&s=234403
 * 2025 (114年) +1.66%: https://www.stat.gov.tw/News_Content.aspx?n=3703&s=235723
 */
export const CPI_ANNUAL = [
  { year: 2024, change: 0.0218 },
  { year: 2025, change: 0.0166 },
] as const;

/** "1.70%" style, for copy. */
export function pct(rate: number, digits = 2): string {
  return `${(rate * 100).toFixed(digits)}%`;
}
