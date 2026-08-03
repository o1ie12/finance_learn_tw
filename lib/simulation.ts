/**
 * First Salary Simulation — pure, testable financial math.
 *
 * Every figure is a named constant grounded in the data given in the brief
 * (Ministry of Labor starting salary, Labor Insurance / NHI employee shares,
 * TPASS fare, Taipei rent ranges). No number is invented at the call site.
 */

// --- Fixed monthly figures (NT$) ---
export const GROSS_SALARY = 36000; // MoL average new-graduate starting salary

// Employee-side mandatory deductions (~3.9% of gross, within the 3–4% brief).
export const LABOR_INSURANCE = 864; // 勞保 employee share ≈ 12% × 20%
export const NHI_PREMIUM = 558; // 健保 employee share ≈ 5.17% × 30%
export const INCOME_TAX = 0; // ~0 at this income after standard deductions

export const NET_SALARY = GROSS_SALARY - LABOR_INSURANCE - NHI_PREMIUM - INCOME_TAX; // 34,578

// Employer contributes 6% to your Labor Pension account ON TOP of salary.
// Not deducted from take-home — shown as an aside that ties back to Module 3.
export const EMPLOYER_PENSION = Math.round(GROSS_SALARY * 0.06); // 2,160

// Baseline living costs (food, phone, daily necessities) excluding rent + transit.
export const LIVING_COST = 12000;

// Transit
export const TPASS_COST = 1200; // TPASS monthly pass
export const TRANSIT_PER_RIDE = 1500; // typical pay-per-ride commuter estimate

export type RentChoiceId = "roommates" | "studio" | "central";

export interface RentOption {
  id: RentChoiceId;
  cost: number;
  label: string; // zh short label
  area: string; // zh district framing
  blurb: string; // zh one-liner
}

export const RENT_OPTIONS: RentOption[] = [
  {
    id: "roommates",
    cost: 10000,
    label: "與室友合租",
    area: "市中心外圍",
    blurb: "通勤較久，但每月省下最多錢。",
  },
  {
    id: "studio",
    cost: 18000,
    label: "套房",
    area: "外圍行政區（內湖、板橋）",
    blurb: "一個人住，離市中心一段距離。",
  },
  {
    id: "central",
    cost: 30000,
    label: "市中心一房",
    area: "蛋黃區（大安、信義）",
    blurb: "生活機能最好，但房租壓力最大。",
  },
];

export function getRentOption(id: RentChoiceId): RentOption {
  const opt = RENT_OPTIONS.find((o) => o.id === id);
  if (!opt) throw new Error(`Unknown rent choice: ${id}`);
  return opt;
}

export interface SimInput {
  rent: RentChoiceId;
  tpass: boolean; // true = TPASS monthly pass, false = pay per ride
  savingsRate: number; // 0–100, percent of leftover cash saved
}

export interface RentOutcome {
  rent: RentChoiceId;
  rentCost: number;
  transitCost: number;
  livingCost: number;
  leftover: number; // net − rent − transit − living (may be negative)
  deficit: boolean; // leftover < 0
  monthlySavings: number;
  monthlySpending: number; // discretionary cash left after saving
  annualSavings: number; // 12 × monthly savings
}

export interface SimOutcome {
  gross: number;
  laborInsurance: number;
  nhi: number;
  incomeTax: number;
  net: number;
  employerPension: number;
  livingCost: number;
  tpass: boolean;
  transitCost: number;
  savingsRate: number;
  chosen: RentOutcome;
  all: RentOutcome[]; // outcome under every rent choice, same transit + savings rate
  alternatives: RentOutcome[]; // the other two rent choices
}

function clampRate(rate: number): number {
  if (Number.isNaN(rate)) return 0;
  return Math.max(0, Math.min(100, Math.round(rate)));
}

export function transitCostFor(tpass: boolean): number {
  return tpass ? TPASS_COST : TRANSIT_PER_RIDE;
}

export function computeRentOutcome(
  rent: RentChoiceId,
  tpass: boolean,
  savingsRate: number,
): RentOutcome {
  const rate = clampRate(savingsRate);
  const rentCost = getRentOption(rent).cost;
  const transitCost = transitCostFor(tpass);
  const leftover = NET_SALARY - rentCost - transitCost - LIVING_COST;
  const deficit = leftover < 0;
  const monthlySavings = deficit ? 0 : Math.round((leftover * rate) / 100);
  const monthlySpending = leftover - monthlySavings; // negative if in deficit
  return {
    rent,
    rentCost,
    transitCost,
    livingCost: LIVING_COST,
    leftover,
    deficit,
    monthlySavings,
    monthlySpending,
    annualSavings: monthlySavings * 12,
  };
}

export function computeSimulation(input: SimInput): SimOutcome {
  const rate = clampRate(input.savingsRate);
  const transitCost = transitCostFor(input.tpass);
  const all = RENT_OPTIONS.map((o) =>
    computeRentOutcome(o.id, input.tpass, rate),
  );
  const chosen = all.find((o) => o.rent === input.rent);
  if (!chosen) throw new Error(`Unknown rent choice: ${input.rent}`);
  return {
    gross: GROSS_SALARY,
    laborInsurance: LABOR_INSURANCE,
    nhi: NHI_PREMIUM,
    incomeTax: INCOME_TAX,
    net: NET_SALARY,
    employerPension: EMPLOYER_PENSION,
    livingCost: LIVING_COST,
    tpass: input.tpass,
    transitCost,
    savingsRate: rate,
    chosen,
    all,
    alternatives: all.filter((o) => o.rent !== input.rent),
  };
}

export function isValidRentChoice(v: unknown): v is RentChoiceId {
  return v === "roommates" || v === "studio" || v === "central";
}
