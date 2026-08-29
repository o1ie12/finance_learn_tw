/**
 * Simplified Tax Return (報稅線 terminal) — pure, testable math.
 *
 * A student picks one of three fictional characters and files a simplified
 * 綜合所得稅 return for them: apply the standard deductions, run the
 * progressive brackets, compare against tax already withheld through the
 * year, see a refund or a bill. Figures (exemption, deduction amounts,
 * bracket thresholds) are illustrative for a recent filing year — flagged
 * for a currency check before publish, same as other figure-bearing lines.
 */

export const PERSONAL_EXEMPTION = 97000; // 免稅額
export const STANDARD_DEDUCTION = 131000; // 標準扣除額
export const SALARY_DEDUCTION_CAP = 207000; // 薪資所得特別扣除額上限

// 綜所稅 progressive brackets — 「速算公式」method: tax = net × rate − offset.
const BRACKETS = [
  { upTo: 590000, rate: 0.05, offset: 0 },
  { upTo: 1330000, rate: 0.12, offset: 41300 },
  { upTo: 2660000, rate: 0.2, offset: 147700 },
  { upTo: 4980000, rate: 0.3, offset: 413700 },
  { upTo: Infinity, rate: 0.4, offset: 911700 },
];

export type CharacterId = "mingming" | "amei" | "kai";

export interface TaxCharacter {
  id: CharacterId;
  name: string;
  role: string;
  annualIncome: number;
  withheld: number; // 已預先扣繳的稅額（雇主每月從薪資預扣）
}

export const TAX_CHARACTERS: TaxCharacter[] = [
  {
    id: "mingming",
    name: "小明",
    role: "超商打工族，時薪制、月薪不固定",
    annualIncome: 180000,
    withheld: 1800,
  },
  {
    id: "amei",
    name: "阿美",
    role: "社會新鮮人，年中領到一筆年終獎金，雇主每月薪資扣繳沒有算進這筆獎金",
    annualIncome: 550000,
    withheld: 4000,
  },
  {
    id: "kai",
    name: "阿凱",
    role: "大學生，同時接了兩份兼職",
    annualIncome: 300000,
    withheld: 4500,
  },
];

export function getCharacter(id: string): TaxCharacter | undefined {
  return TAX_CHARACTERS.find((c) => c.id === id);
}
export function isCharacterId(v: unknown): v is CharacterId {
  return TAX_CHARACTERS.some((c) => c.id === v);
}

export interface TaxOutcome {
  character: TaxCharacter;
  salaryDeduction: number;
  netIncome: number; // 綜合所得淨額
  taxOwed: number; // 應納稅額
  bracketRate: number; // marginal rate applied
  withheld: number;
  balance: number; // withheld - taxOwed；positive = refund, negative = owe
  isRefund: boolean;
}

function computeProgressiveTax(net: number): { tax: number; rate: number } {
  const bracket = BRACKETS.find((b) => net <= b.upTo) ?? BRACKETS[BRACKETS.length - 1];
  const tax = Math.max(0, Math.round(net * bracket.rate - bracket.offset));
  return { tax, rate: bracket.rate };
}

export function computeTax(characterId: CharacterId): TaxOutcome {
  const character = getCharacter(characterId) ?? TAX_CHARACTERS[0];
  const salaryDeduction = Math.min(SALARY_DEDUCTION_CAP, character.annualIncome);
  const netIncome = Math.max(
    0,
    character.annualIncome - PERSONAL_EXEMPTION - STANDARD_DEDUCTION - salaryDeduction,
  );
  const { tax, rate } = computeProgressiveTax(netIncome);
  const balance = character.withheld - tax;

  return {
    character,
    salaryDeduction,
    netIncome,
    taxOwed: tax,
    bracketRate: rate,
    withheld: character.withheld,
    balance,
    isRefund: balance >= 0,
  };
}
