/**
 * College Cost Calculator (學貸線 terminal) — pure, testable math.
 *
 * Figures are illustrative and grounded in the general, well-documented gap
 * between Taiwan's public/private tuition levels and typical dorm/rent
 * costs — round numbers, not scraped from any single year's official
 * table. Flagged for a currency check before publish, same as other
 * figure-bearing lines. Reuses qixin's GROSS_SALARY for the salary
 * comparison so the whole app stays internally consistent.
 */
import { GROSS_SALARY } from "@/lib/simulation";

export const YEARS = 4;

export type SchoolType = "public" | "private";

export interface SchoolOption {
  id: SchoolType;
  label: string;
  tuitionPerSemester: number;
}

export const SCHOOL_OPTIONS: SchoolOption[] = [
  { id: "public", label: "公立大學", tuitionPerSemester: 29000 },
  { id: "private", label: "私立大學", tuitionPerSemester: 58000 },
];

export type HousingType = "dorm" | "renting" | "commute";

export interface HousingOption {
  id: HousingType;
  label: string;
  monthlyCost: number; // during the ~10 school months/year
}

export const HOUSING_OPTIONS: HousingOption[] = [
  { id: "dorm", label: "住校內宿舍", monthlyCost: 3500 },
  { id: "renting", label: "在外租屋", monthlyCost: 8000 },
  { id: "commute", label: "通勤（住家裡）", monthlyCost: 1500 },
];

const SCHOOL_MONTHS_PER_YEAR = 10;
const LOAN_REPAYMENT_YEARS = 10;

export function getSchool(id: string): SchoolOption | undefined {
  return SCHOOL_OPTIONS.find((s) => s.id === id);
}
export function getHousingType(id: string): HousingOption | undefined {
  return HOUSING_OPTIONS.find((h) => h.id === id);
}
export function isSchoolType(v: unknown): v is SchoolType {
  return v === "public" || v === "private";
}
export function isHousingType(v: unknown): v is HousingType {
  return v === "dorm" || v === "renting" || v === "commute";
}

export interface StudentLoanInput {
  school: SchoolType;
  housing: HousingType;
  loanCoversPct: number; // 0-100, share of the 4-year total covered by 就學貸款
}

export interface StudentLoanOutcome {
  school: SchoolOption;
  housing: HousingOption;
  tuitionTotal: number; // 4 years
  housingTotal: number; // 4 years
  grandTotal: number;
  loanCoversPct: number;
  loanAmount: number;
  selfFunded: number; // grandTotal - loanAmount
  monthlyRepayment: number; // over LOAN_REPAYMENT_YEARS after graduation
  estimatedStartingSalary: number;
  repaymentAsPctOfSalary: number; // monthlyRepayment / estimatedStartingSalary * 100
}

function clampPct(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

export function computeStudentLoan(input: StudentLoanInput): StudentLoanOutcome {
  const school = getSchool(input.school) ?? SCHOOL_OPTIONS[0];
  const housing = getHousingType(input.housing) ?? HOUSING_OPTIONS[0];
  const pct = clampPct(input.loanCoversPct);

  const tuitionTotal = school.tuitionPerSemester * 2 * YEARS;
  const housingTotal = housing.monthlyCost * SCHOOL_MONTHS_PER_YEAR * YEARS;
  const grandTotal = tuitionTotal + housingTotal;

  const loanAmount = Math.round((grandTotal * pct) / 100);
  const selfFunded = grandTotal - loanAmount;
  const monthlyRepayment =
    loanAmount > 0 ? Math.round(loanAmount / (LOAN_REPAYMENT_YEARS * 12)) : 0;
  const estimatedStartingSalary = GROSS_SALARY;
  const repaymentAsPctOfSalary =
    estimatedStartingSalary > 0
      ? Math.round((monthlyRepayment / estimatedStartingSalary) * 1000) / 10
      : 0;

  return {
    school,
    housing,
    tuitionTotal,
    housingTotal,
    grandTotal,
    loanCoversPct: pct,
    loanAmount,
    selfFunded,
    monthlyRepayment,
    estimatedStartingSalary,
    repaymentAsPctOfSalary,
  };
}
