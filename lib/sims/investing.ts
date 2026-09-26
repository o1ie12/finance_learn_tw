/**
 * First Investment Simulation (投資線 terminal) — pure, testable.
 *
 * The student has a lump sum and decides what to do with it. Investing carries
 * real variance, so each option shows a RANGE (pessimistic / expected /
 * optimistic) rather than a single guaranteed number — the bands are clearly
 * illustrative, not predictions. Any sale surfaces the flat 0.3% securities
 * transaction tax (證交稅), consistent with Module 5. 抽籤 (IPO lottery) is a
 * low-stakes aside: principal is returned if you don't win.
 */

/**
 * Fallback starting sum, used only when the student has no savings figure of
 * their own. Resolved from the profile where one exists — see
 * investableAmount() — so the money on screen is the money they built up in
 * 存錢線 rather than a number the simulation assumed for them.
 */
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
 */
export const STOCK_TAX_RATE = 0.003;
export const ETF_TAX_RATE = 0.001;

export type InvestChoiceId = "savings" | "buy0050" | "buy0056" | "spend";

interface InvestChoiceDef {
  id: InvestChoiceId;
  label: string;
  blurb: string;
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
    low: 1.016,
    mid: 1.016,
    high: 1.016,
    sellable: false,
    taxRate: 0,
    certain: true,
  },
  {
    id: "buy0050",
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
  ipo: boolean;
  ipoNote: string;
  chosen: InvestBand & {
    // 證交稅 if the student sells at the expected (mid) value; 0 for non-sellable
    taxOnMidSale: number;
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
  ipo: boolean;
  /** Resolved from the student's profile by the API route. */
  start?: number;
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

  const ipoNote = input.ipo
    ? "你用一小筆錢參加了幾檔抽籤。抽中機率不高——沒中的錢會原封退回，所以風險很低；就當作認識市場的第一步。"
    : "你這次沒參加抽籤。抽籤（申購）只花一點點手續費，沒中就退錢，是很多人第一次接觸公開發行的方式。";

  return {
    start,
    ipo: input.ipo,
    ipoNote,
    chosen: {
      ...chosenBand,
      taxOnMidSale,
      netAfterTaxMid: chosenBand.mid - taxOnMidSale,
    },
    all,
  };
}
