import type { CreditRecordValue } from "@/lib/studentProfile";

/**
 * 買房 vs 租屋 — the capstone simulation.
 *
 * Every other line answers one question in isolation. This one is the only
 * place where they collide, which is why it is the finale and why it is a
 * single scenario rather than several: income decides what the payment can
 * be, 存錢線 decides whether there is a deposit at all, 信用線 decides the
 * rate and whether a bank says yes, and 投資線 turns the deposit into a
 * genuine either/or rather than a free choice.
 *
 * Nothing here gates the student. A decision they cannot afford is still a
 * decision they can make — the simulation shows them the consequence, in
 * their own numbers, the same way the credit-card bill shows interest rather
 * than refusing the purchase.
 *
 * The property figures are illustrative and labelled as such. They are the
 * scenario's furniture, not a claim about the housing market; what is real
 * about the result is the student's own position running through it.
 */

/** Shown wherever these scenario figures appear. */
export const FIGURES_NOTE = "房價與租金為示意用的情境設定，非市場統計";

/** A modest first home outside the most expensive districts. Illustrative. */
export const PROPERTY_PRICE = 8_000_000;
/** Banks in Taiwan commonly lend up to 80% on a first home. */
export const DOWN_PAYMENT_RATE = 0.2;
export const MORTGAGE_YEARS = 30;
/** A comparable place, rented rather than bought. Illustrative. */
export const MONTHLY_RENT = 15_000;

/**
 * The rate a bank offers, by credit record.
 *
 * The spread is the entire point of the chain from 信用線: the same flat, the
 * same salary, and a record built three simulations ago changes what the next
 * thirty years cost. Illustrative, but the ordering and rough gap are real.
 */
export const MORTGAGE_RATES: Record<CreditRecordValue, number> = {
  good: 0.021,
  fair: 0.025,
  poor: 0.032,
};

/** Above this share of income, a bank is unlikely to lend regardless of record. */
export const AFFORDABILITY_CEILING = 0.45;
/** Above this, it is affordable on paper and uncomfortable in practice. */
export const AFFORDABILITY_STRETCH = 0.33;

/** Illustrative long-run return, used only for the opportunity-cost aside. */
export const ASSUMED_ANNUAL_RETURN = 0.05;
export const OPPORTUNITY_YEARS = 10;

export type HousingChoice = "buy" | "rent";
export type HousingVerdict = "comfortable" | "stretched" | "not_viable";

export interface BuyVsRentInput {
  choice: HousingChoice;
  income: number;
  savings: number;
  creditRecord: CreditRecordValue;
  investedAmount: number;
  hasInvested: boolean;
}

export interface BuyVsRentOutcome {
  choice: HousingChoice;
  /** Echoed so the stored result explains itself without the profile. */
  income: number;
  savings: number;
  creditRecord: CreditRecordValue;
  investedAmount: number;
  hasInvested: boolean;

  price: number;
  downPaymentRequired: number;
  /** Savings alone. */
  downPaymentAvailable: number;
  /** Savings plus everything currently invested. */
  downPaymentWithInvestments: number;
  /** How far short, using savings plus investments. 0 when covered. */
  downPaymentShortfall: number;
  canCoverDownPayment: boolean;
  /** True only when investments are what close the gap. */
  needsInvestmentsToCover: boolean;

  annualRate: number;
  monthlyMortgage: number;
  mortgageShareOfIncome: number;
  totalInterestOverTerm: number;
  /** What the same mortgage would cost with a good record. */
  monthlyMortgageAtBestRate: number;
  approvalLikely: boolean;

  monthlyRent: number;
  rentShareOfIncome: number;

  verdict: HousingVerdict;
  /** Present only when the student has money invested. */
  opportunityCost: {
    years: number;
    amountNow: number;
    valueIfLeftInvested: number;
  } | null;
}

/** Standard amortised payment. Returns 0 for a zero or negative principal. */
export function monthlyPayment(
  principal: number,
  annualRate: number,
  years: number,
): number {
  if (principal <= 0) return 0;
  const r = annualRate / 12;
  const n = years * 12;
  if (r === 0) return Math.round(principal / n);
  return Math.round((principal * r) / (1 - Math.pow(1 + r, -n)));
}

export function computeBuyVsRent(input: BuyVsRentInput): BuyVsRentOutcome {
  const income = Math.max(0, Math.round(input.income));
  const savings = Math.max(0, Math.round(input.savings));
  const investedAmount = Math.max(0, Math.round(input.investedAmount));

  const price = PROPERTY_PRICE;
  const downPaymentRequired = Math.round(price * DOWN_PAYMENT_RATE);
  const downPaymentWithInvestments = savings + investedAmount;
  const canCoverDownPayment = downPaymentWithInvestments >= downPaymentRequired;
  const needsInvestmentsToCover =
    canCoverDownPayment && savings < downPaymentRequired;
  const downPaymentShortfall = Math.max(
    0,
    downPaymentRequired - downPaymentWithInvestments,
  );

  const annualRate = MORTGAGE_RATES[input.creditRecord];
  // The loan is always sized against the full deposit, so the payment shown
  // is the payment for the purchase they are actually contemplating — not a
  // smaller, flattering one derived from money they do not have.
  const principal = price - downPaymentRequired;
  const monthlyMortgage = monthlyPayment(principal, annualRate, MORTGAGE_YEARS);
  const monthlyMortgageAtBestRate = monthlyPayment(
    principal,
    MORTGAGE_RATES.good,
    MORTGAGE_YEARS,
  );
  const totalInterestOverTerm =
    monthlyMortgage * MORTGAGE_YEARS * 12 - principal;
  const mortgageShareOfIncome = income > 0 ? monthlyMortgage / income : 1;
  const rentShareOfIncome = income > 0 ? MONTHLY_RENT / income : 1;

  // A poor record is not merely a worse price. Saying so outright is the
  // felt consequence 信用線 earns — the same way its own simulation let the
  // student watch interest accumulate rather than describing it.
  const approvalLikely =
    input.creditRecord !== "poor" &&
    mortgageShareOfIncome <= AFFORDABILITY_CEILING;

  let verdict: HousingVerdict;
  if (input.choice === "buy") {
    if (!canCoverDownPayment || !approvalLikely) {
      verdict = "not_viable";
    } else if (mortgageShareOfIncome > AFFORDABILITY_STRETCH) {
      verdict = "stretched";
    } else {
      verdict = "comfortable";
    }
  } else {
    verdict =
      rentShareOfIncome > AFFORDABILITY_CEILING
        ? "not_viable"
        : rentShareOfIncome > AFFORDABILITY_STRETCH
          ? "stretched"
          : "comfortable";
  }

  // Only asked when there is actually money invested — otherwise it is a
  // rhetorical question about an empty account.
  const opportunityCost =
    input.hasInvested && investedAmount > 0
      ? {
          years: OPPORTUNITY_YEARS,
          amountNow: investedAmount,
          valueIfLeftInvested: Math.round(
            investedAmount *
              Math.pow(1 + ASSUMED_ANNUAL_RETURN, OPPORTUNITY_YEARS),
          ),
        }
      : null;

  return {
    choice: input.choice,
    income,
    savings,
    creditRecord: input.creditRecord,
    investedAmount,
    hasInvested: input.hasInvested,
    price,
    downPaymentRequired,
    downPaymentAvailable: savings,
    downPaymentWithInvestments,
    downPaymentShortfall,
    canCoverDownPayment,
    needsInvestmentsToCover,
    annualRate,
    monthlyMortgage,
    mortgageShareOfIncome,
    totalInterestOverTerm,
    monthlyMortgageAtBestRate,
    approvalLikely,
    monthlyRent: MONTHLY_RENT,
    rentShareOfIncome,
    verdict,
    opportunityCost,
  };
}

export function isHousingChoice(v: unknown): v is HousingChoice {
  return v === "buy" || v === "rent";
}
