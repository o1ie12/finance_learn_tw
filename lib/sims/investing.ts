/**
 * First Investment Simulation (投資線 terminal) — pure, testable.
 *
 * The student has a lump sum and decides what to do with it. Investing carries
 * real variance, so each option shows a RANGE (pessimistic / expected /
 * optimistic) rather than a single guaranteed number — the bands are clearly
 * illustrative, not predictions. Any sale surfaces the securities transaction
 * tax (證交稅) at the rate for what is sold, consistent with Module 5: every
 * sellable choice here is an ETF, so 0.1% (see ETF_TAX_RATE below), plus the
 * broker's 手續費 on both the buy and the sale.
 *
 * 抽籤 used to be a choice that changed one sentence. No official source
 * publishes a typical 中籤率 (each offering's rate is announced separately and
 * varies widely), so a "realistic draw" would be a number we made up. It is
 * now a tip (IPO_TIP), not a decision.
 */

/**
 * Fallback starting sum, used only when the student has no savings figure of
 * their own. Resolved from the profile where one exists — see
 * investableAmount() — so the money on screen is the money they built up in
 * 存錢線 rather than a number the simulation assumed for them.
 */
import type { TickerId } from "@/lib/sims/historicalReplay";
import { TIME_DEPOSIT_1Y } from "@/lib/rates";
import {
  compareTiming,
  type InvestTiming,
  type TimingComparison,
} from "@/lib/sims/investTiming";

export const INVEST_START = 50000;

/**
 * 證交稅 rates by instrument. Taiwan taxes the SALE, not the gain, and the
 * rate depends on what is sold: 股票 at 0.3%, ETF (受益憑證) at 0.1%.
 *
 * This used to be one module-level constant at the stock rate, applied to
 * every sellable option — and every sellable option here is an ETF, so every
 * tax figure the simulation showed was three times too high. It sat that way
 * through a meeting with 證基會, whose entire interest in this platform is
 * that it gets Taiwan's own market rules right. The rate now lives on each
 * choice, so a future non-ETF option cannot silently inherit the wrong one.
 *
 * Source (verified 2026-10-06): 證券交易稅條例 §2 (law.moj.gov.tw pcode
 * G0340078) — 股票 千分之三; ETF 受益憑證 千分之一 per 財政部稅務入口網 FAQ
 * (etax.nat.gov.tw, 證券交易稅 Q&A). Student-facing copy that names these
 * rates is pinned by tests/regressions.test.ts ("投資線 copy").
 */
export const STOCK_TAX_RATE = 0.003;

/**
 * 券商手續費, charged on BOTH the buy and the sale: 0.1425% is the reference
 * rate; brokers have set their own discounts since 2008, and the old NT$20
 * minimum rule 不再援用 since 2021-10-01 (twse-regulation FE064320, verified
 * 2026-10-06, same source as station 5). Shown as the reference rate, with
 * the discount stated beside it.
 */
export const BROKER_FEE_RATE = 0.001425;
export const BROKER_FEE_LABEL = "0.1425%";

/** Shown in place of the old 抽籤 choice. */
export const IPO_TIP =
  "新股上市時可以參加抽籤（申購）：要付一筆處理費，抽中才用承銷價扣款買進，沒抽中就不扣股款。熱門的新股常常上萬人搶，抽中的機率每一檔都不一樣，公告時才知道——所以把它當作認識市場的方式，不要當成賺錢的方法。";
export const ETF_TAX_RATE = 0.001;

export type InvestChoiceId = "savings" | "buy0050" | "buy0056" | "spend";

interface InvestChoiceDef {
  id: InvestChoiceId;
  label: string;
  blurb: string;
  /** The exchange ticker, for the timing comparison. Absent = not a security. */
  ticker?: TickerId;
  // one-year multipliers on the starting amount
  low: number;
  mid: number;
  high: number;
  sellable: boolean; // triggers 證交稅 on sale
  /** 證交稅 on sale. 0 for anything that is not sold on an exchange. */
  taxRate: number;
  certain: boolean; // effectively fixed (savings)
}

/** "0.1%" for display. */
export function taxRateLabel(rate: number): string {
  return `${(rate * 100).toFixed(rate * 100 < 1 ? 1 : 1)}%`;
}

// Illustrative one-year bands. 0050 ~ broad market (higher spread), 0056 ~
// dividend (narrower), 定存 ~ fixed. Not predictions.
export const INVEST_CHOICES: InvestChoiceDef[] = [
  {
    id: "savings",
    label: "放定存",
    blurb: "幾乎不會虧，但成長最慢。錢的購買力可能被通膨慢慢吃掉。",
    low: 1 + TIME_DEPOSIT_1Y.rate,
    mid: 1 + TIME_DEPOSIT_1Y.rate,
    high: 1 + TIME_DEPOSIT_1Y.rate,
    sellable: false,
    taxRate: 0,
    certain: true,
  },
  {
    id: "buy0050",
    ticker: "0050",
    label: "買 0050",
    blurb: "一次持有台灣市值最大的一批公司，波動較大，長期成長潛力也較高。",
    low: 0.82,
    mid: 1.07,
    high: 1.28,
    sellable: true,
    taxRate: ETF_TAX_RATE,
    certain: false,
  },
  {
    id: "buy0056",
    ticker: "0056",
    label: "買 0056",
    blurb: "以配息為特色，波動通常比 0050 小一些。",
    low: 0.9,
    mid: 1.05,
    high: 1.18,
    sellable: true,
    taxRate: ETF_TAX_RATE,
    certain: false,
  },
  {
    id: "spend",
    label: "全部花掉",
    blurb: "換來當下的東西，但這筆錢就沒有成長的機會了。",
    low: 0,
    mid: 0,
    high: 0,
    sellable: false,
    taxRate: 0,
    certain: false,
  },
];

export function getInvestChoice(id: string): InvestChoiceDef | undefined {
  return INVEST_CHOICES.find((c) => c.id === id);
}
export function isInvestChoiceId(v: unknown): v is InvestChoiceId {
  return INVEST_CHOICES.some((c) => c.id === v);
}

export interface InvestBand {
  id: InvestChoiceId;
  label: string;
  low: number;
  mid: number;
  high: number;
  certain: boolean;
  sellable: boolean;
  taxRate: number;
}

export interface InvestOutcome {
  start: number;
  /** Stored so the result, coach and certificate can call a default a default. */
  startFromSavingsLine: boolean;
  /** How the money went in. Only bites for a security; recorded regardless. */
  timing: InvestTiming;
  /**
   * Both timings valued over the same real window, for a security. Null for
   * 定存 and 花掉, where there is nothing to time. Never a recommendation —
   * see lib/sims/investTiming.ts.
   */
  historical: TimingComparison | null;
  chosen: InvestBand & {
    // 證交稅 if the student sells at the expected (mid) value; 0 for non-sellable
    taxOnMidSale: number;
    /** 手續費 on the purchase (the starting sum). 0 when nothing is bought. */
    buyFee: number;
    /** 手續費 on a sale at the mid value. */
    sellFeeOnMid: number;
    /** buyFee + sellFeeOnMid + taxOnMidSale: one round trip's cost. */
    totalCostOnMid: number;
    /** Mid value after the sale's tax and fee (the buy fee is paid up front). */
    netAfterTaxMid: number;
  };
  all: InvestBand[];
}

function band(def: InvestChoiceDef, start: number): InvestBand {
  return {
    id: def.id,
    label: def.label,
    low: Math.round(start * def.low),
    mid: Math.round(start * def.mid),
    high: Math.round(start * def.high),
    certain: def.certain,
    sellable: def.sellable,
    taxRate: def.taxRate,
  };
}

export interface InvestInput {
  choice: InvestChoiceId;
  /** Ignored. Kept so older callers still typecheck; see IPO_TIP. */
  ipo?: boolean;
  /** Resolved from the student's profile by the API route. */
  start?: number;
  /** True when `start` is what 存錢線 produced, false when it is the default. */
  startFromSavingsLine?: boolean;
  /** 一次投入 or 定期定額. Defaults to lump so older callers keep working. */
  timing?: InvestTiming;
}

export function computeInvesting(input: InvestInput): InvestOutcome {
  const start =
    Number.isFinite(input.start) && (input.start as number) > 0
      ? Math.round(input.start as number)
      : INVEST_START;
  const def = getInvestChoice(input.choice) ?? INVEST_CHOICES[0];
  const all = INVEST_CHOICES.map((c) => band(c, start));
  const chosenBand = band(def, start);

  const taxOnMidSale = def.sellable
    ? Math.round(chosenBand.mid * def.taxRate)
    : 0;
  const buyFee = def.sellable ? Math.round(start * BROKER_FEE_RATE) : 0;
  const sellFeeOnMid = def.sellable ? Math.round(chosenBand.mid * BROKER_FEE_RATE) : 0;

  // Timing only exists for a security. For 定存 or 花掉 there is nothing to
  // time, so a selection left over from a previous ETF pick is not recorded
  // as the student's decision — the coach and certificate would otherwise
  // describe "定期定額 into 放定存", a choice they never made.
  const timing: InvestTiming = def.ticker ? (input.timing ?? "lump") : "lump";
  const historical = def.ticker ? compareTiming(def.ticker, start) : null;

  return {
    start,
    startFromSavingsLine: Boolean(input.startFromSavingsLine),
    timing,
    historical,
    chosen: {
      ...chosenBand,
      taxOnMidSale,
      buyFee,
      sellFeeOnMid,
      totalCostOnMid: buyFee + sellFeeOnMid + taxOnMidSale,
      netAfterTaxMid: chosenBand.mid - taxOnMidSale - sellFeeOnMid,
    },
    all,
  };
}
