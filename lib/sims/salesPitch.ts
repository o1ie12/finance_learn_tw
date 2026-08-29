/**
 * 業務員對話 (保險線 terminal) — a sequential three-round pitch/decision
 * game, not a financial-math simulation. "都不買" (decline everything) is a
 * genuinely valid, positively-framed winning ending, not a fallback —
 * matching the brief's explicit instruction.
 */

export type ProductId = "savings" | "accident" | "reimbursement";

export interface Product {
  id: ProductId;
  name: string;
  pitch: string; // what the salesperson says
  truth: string; // the balanced reality, shown after the student decides
}

export const PRODUCTS: Product[] = [
  {
    id: "savings",
    name: "儲蓄險",
    pitch: "這張保單存錢又有保障，比放銀行定存划算多了，而且滿期還可以領回一大筆錢喔！",
    truth: "儲蓄險的保障部分通常很低，主要功能是強迫儲蓄，提前解約經常會虧本，流動性也遠不如定存。",
  },
  {
    id: "accident",
    name: "意外險",
    pitch: "意外險保費便宜，萬一發生意外骨折、燒燙傷，都有一筆理賠金，年輕人風險最高，真的該有一張。",
    truth: "意外險保障意外事故導致的傷殘或身故，保費相對便宜，是許多人優先建立的基礎保障之一。",
  },
  {
    id: "reimbursement",
    name: "醫療實支實付",
    pitch: "健保不會全額給付病房差額跟自費藥物，這張實支實付可以補上這個缺口，住院比較不會有壓力。",
    truth: "實支實付依實際自費醫療支出理賠，補上健保給付範圍外的缺口，是常見的醫療保障補強方式。",
  },
];

export type Decision = "buy" | "decline";

export interface SalesPitchInput {
  decisions: Record<ProductId, Decision>;
}

export interface SalesPitchOutcome {
  decisions: Record<ProductId, Decision>;
  bought: ProductId[];
  boughtSavings: boolean;
  allDeclined: boolean;
}

export function isDecision(v: unknown): v is Decision {
  return v === "buy" || v === "decline";
}

export function computeSalesPitch(input: SalesPitchInput): SalesPitchOutcome {
  const bought = PRODUCTS.filter((p) => input.decisions[p.id] === "buy").map((p) => p.id);
  return {
    decisions: input.decisions,
    bought,
    boughtSavings: bought.includes("savings"),
    allDeclined: bought.length === 0,
  };
}
