/**
 * Every number the life game uses, with its source.
 *
 * Rules (02-LIFE-GAME §3):
 *  - Reuse the repo's existing constant objects; never restate a verified
 *    figure here. Payroll comes from TAX_YEAR, deposits from rates.ts, card
 *    rules from creditCard.ts, ETF fees and tax from investing.ts.
 *  - Anything not from a primary source is `示意` and the screen labels it.
 *    `illustrative: true` on an object means every amount in it is 示意.
 */

import { DEMAND_SAVINGS, TIME_DEPOSIT_1Y } from "@/lib/rates";
import { TAX_YEAR } from "@/lib/sims/taxFiling";
import { BROKER_FEE_RATE, ETF_TAX_RATE } from "@/lib/tradingCosts";

export const STATE_VERSION = 1 as const;

/** The game starts in July: the first job after graduation. */
export const START_CALENDAR_MONTH = 7 as const;
export const START_AGE_MONTHS = 22 * 12;

/** Cash a new graduate starts with: 爸媽給你的第一筆生活費, shown on the first payday (05 A8.7). 示意. */
export const STARTING_CASH = 10_000;

/**
 * 生活風格 (05 Part B): monthly 想要 spending by level, 示意. From the
 * LIFESTYLE_SAVE_STREAK-th 省 month in a row, stress grows by
 * LIFESTYLE_SAVE_STRESS a month, up to LIFESTYLE_SAVE_STRESS_CAP (a life with
 * no fun is hard to keep up). 普通 or 享受 resets the streak.
 */
export const LIFESTYLE = { save: 3_000, normal: 7_000, enjoy: 12_000 } as const;
export const LIFESTYLE_SAVE_STREAK = 3;
export const LIFESTYLE_SAVE_STRESS = 5;
export const LIFESTYLE_SAVE_STRESS_CAP = 15;

// --- payroll -----------------------------------------------------------------

/**
 * Payroll rates: TAX_YEAR.payroll (勞保 12.5% × 20%, cap 45,800; 健保 5.17% ×
 * 30%). Already verified in lib/sims/taxFiling.ts; read, never copied.
 */
export const PAYROLL = TAX_YEAR.payroll;

/**
 * 2026 最低工資 (monthly). 勞動部 公告: 115年1月1日起 每月最低工資 NT$29,500.
 * See docs/redesign/sources.md item 1 for the URL and quote.
 */
export const MIN_MONTHLY_WAGE_2026 = 29_500;

/**
 * 勞退自提: 0 to 6% of wage, voluntary, deductible from that year's salary
 * income (勞工退休金條例 §14 III). sources.md item 2.
 */
export const PENSION_SELF_MAX_RATE = 0.06;

/**
 * 失業給付: 60% of the average insured salary of the 6 months before leaving,
 * for up to 6 months (就業保險法 §16). sources.md item 8.
 */
export const UNEMPLOYMENT_RATE = 0.6;
export const LAYOFF_MONTHS = 3; // 示意: how long the game keeps the student jobless

// --- deposits ------------------------------------------------------------------

/** 臺灣銀行 活期儲蓄 0.825%, lib/rates.ts. Interest monthly on the end balance. */
export const DEMAND_RATE = DEMAND_SAVINGS.rate;
/** 臺灣銀行 一年期定存 1.70%, lib/rates.ts. Interest paid monthly (按月領息). */
export const TIME_DEPOSIT_RATE = TIME_DEPOSIT_1Y.rate;
export const TIME_DEPOSIT_TERM = 12 as const;
/** 房屋基金 earns the 定存 rate. 示意 (02 §3.4). */
export const HOUSING_FUND_RATE = TIME_DEPOSIT_1Y.rate;

// --- bills -------------------------------------------------------------------

/** The monthly bill sheet (02 §3.3). All 示意 except transport. */
export const BILLS = {
  illustrative: true,
  familyContribution: 3_000, // 孝親費, living at home
  rentShared: 8_000, // 雅房
  rentStudio: 14_000, // 套房
  utilitiesRenting: 900, // 水電瓦斯, renting only
  food: 9_000, // NT$300 a day
  phone: 499,
  daily: 1_500, // 日用品
  movingCost: 6_000, // rent_up → 搬家
  rentRaise: 1_000, // rent_up
} as const;

/**
 * 交通: TPASS 基北北桃 月票 NT$1,200 (交通部 TPASS). sources.md item 3.
 * The cheaper option (騎腳踏車／走路) unlocked by 消費線 is 示意.
 */
export const TRANSPORT = {
  tpass: 1_200,
  bike: 300, // 示意
} as const;

/** Bounds when 消費線 unlocks editing the flexible items. 示意. */
export const FLEX_BOUNDS = {
  food: { min: 6_000, max: 15_000, step: 500 },
  daily: { min: 800, max: 3_000, step: 100 },
} as const;

// --- investing -----------------------------------------------------------------

/** 券商手續費 0.1425% (lib/tradingCosts.ts). */
export const BUY_FEE_RATE = BROKER_FEE_RATE;
/**
 * Minimum fee per board-lot trade, NT$20: a broker's own price (永豐金證券
 * fee page, sources.md item 7b). The exchange stopped enforcing the NT$20
 * rule in 2021 (twse-regulation FE064320, see investing.ts). Brokers do not
 * apply it to 定期定額 orders, so the standing monthly buy pays the rate only.
 */
export const MIN_BROKER_FEE = 20;
/** ETF 證交稅 0.1% on the sale (lib/tradingCosts.ts). */
export const SELL_TAX_RATE = ETF_TAX_RATE;
/** 定期定額 minimum per month: NT$1,000 at 元大 and 富邦 (sources.md item 7a). */
export const ETF_MONTHLY_MIN = 1_000;

/**
 * Trailing 12-month cash dividend yields on the 2026-10-16 close (TWSE
 * TWT49U + STOCK_DAY, sources.md items 5 and 6):
 *   0050: NT$1.60 / NT$109.00 = 1.47%, paid twice a year (Jan, Jul).
 *   0056: NT$4.082 / NT$58.75 = 6.95%, paid quarterly (Jan, Apr, Jul, Oct).
 * The game pays each period's share of the yearly rate on that month's
 * market value. Ex-dividend months are the funds' recent pattern.
 */
export const DIVIDEND_YIELD = {
  etfBroad: { rate: 0.0147, months: [1, 7] as readonly number[], illustrative: false },
  etfDividend: { rate: 0.0695, months: [1, 4, 7, 10] as readonly number[], illustrative: false },
} as const;

/** market_drop fires on a monthly ETF return at or below this (02 §6). */
export const MARKET_DROP_TRIGGER = -0.08;

// --- insurance (02 §3.5) — all premiums 示意 for a healthy 22-year-old ----------

export const INSURANCE = {
  illustrative: true,
  medical: { premium: 600, share: 0.9, capPerEvent: 100_000 },
  accident: { premium: 120, share: 1.0, capPerEvent: 50_000 },
  life: { premium: 900 },
} as const;

// --- card (02 §3.6) ------------------------------------------------------------

/** Card limit in the game. 示意. Interest and fees come from creditCard.ts. */
export const GAME_CARD_LIMIT = 30_000;

// --- moves ---------------------------------------------------------------------

export const SKILL = { monthly: 2_000, months: 6, illustrative: true } as const;
export const COURSE_SKILL = { cost: 1_990, months: 3, illustrative: true } as const;
export const SIDE_BUSINESS = { setup: 20_000, mean: 3_000, spread: 4_000, illustrative: true } as const;
export const GIVING_STRESS_RELIEF = 3;

// --- events --------------------------------------------------------------------

export const RAISE = { pct: 0.05, chance: 0.5, chanceWithSkill: 0.8, every: 12, illustrative: true } as const;
export const BONUS = { chance: 0.7, months: 1, illustrative: true } as const;
export const GUARANTEE = {
  amount: 50_000,
  triggerChance: 0.25,
  minTurnsAhead: 6,
  maxTurnsAhead: 18,
  monthlyPayment: 5_000,
  illustrative: true,
} as const;
export const FRIEND_LOAN = { amount: 5_000, dueInTurns: 3 } as const;
export const MAX_RANDOM_EVENTS_PER_TURN = 2;

/**
 * Every event amount (02 §6 table; card text in 04 §14). All 示意: typical
 * prices a student would recognise, not sourced figures. The screen tags
 * them 示意.
 */
export const EVENT_COSTS = {
  illustrative: true,
  phone_break: 6_000,
  dental: 6_000, // after 健保
  scooter_service: 2_500,
  accident: 12_000,
  hospital: 30_000,
  birthday: 1_500,
  concert: 4_800,
  japanTrip: 25_000,
  japanTripShort: 15_000,
  newPhone: 32_000,
  newPhoneMonthly: 2_667, // 11 payments
  newPhoneLast: 2_663, // the 12th: 11 × 2,667 + 2,663 = 32,000
  newPhoneTurns: 12,
  scamLoss: 10_000,
  familyHelpHigh: 5_000,
  familyHelpLow: 2_000,
  invoice: 200,
  moodBuy: 2_800, // 06 P2 task 9: the tempting purchase on a bad day
} as const;

/** 06 P2 task 9: the 情緒消費 event comes only when stress is at least this. */
export const MOOD_EVENT_MIN_STRESS = 40;

// --- stats ---------------------------------------------------------------------

/** Cash above this counts toward the emergency fund (02 §5). */
export const CASH_BUFFER = 5_000;
export const EF_TARGET_MONTHS = 3;
export const HISTORY_FULL_TURNS = 36;
export const LEDGER_EVERY = 3;
export const LEDGER_TRIES = 2;
export const FAST_FORWARD_TURNS = 12;

/** Whole-dollar rounding at posting time, half away from zero (02 §2). */
export function roundMoney(x: number): number {
  const r = Math.sign(x) * Math.floor(Math.abs(x) + 0.5);
  return r === 0 ? 0 : r;
}
