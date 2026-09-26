/**
 * College Cost Calculator (學貸線 terminal) — pure, testable math.
 *
 * Figures are illustrative and grounded in the general, well-documented gap
 * between Taiwan's public/private tuition levels and typical dorm/rent
 * costs — round numbers, not scraped from any single year's official
 * table. Flagged for a currency check before publish, same as other
 * figure-bearing lines.
 *
 * The salary the repayment is compared against is the student's own, from
 * 職涯線 via the profile, with the platform's one documented stand-in when
 * they have not run it. It used to be a constant from the retired 起薪
 * simulation — a number that was nobody's, presented as the student's.
 */

export const YEARS = 4;

/**
 * Post-graduation interest, illustrative and labelled so on screen.
 *
 * 就學貸款 is subsidised during study and carries interest once repayment
 * starts; the actual rate is set by 教育部 and the lending banks and moves
 * with the reference rate. The previous version repaid at zero interest,
 * which contradicted station 15's own point that the debt keeps accruing.
 */
export const LOAN_ANNUAL_RATE = 0.0165;

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
  /** Injected by the API route from the profile — never from the request. */
  startingSalary: number;
  /** True when startingSalary came from 職涯線 rather than the stand-in. */
  salaryFromCareer: boolean;
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
  monthlyRepayment: number; // amortised over LOAN_REPAYMENT_YEARS after graduation
  annualRate: number;
  totalInterest: number; // what the loan costs beyond the principal
  estimatedStartingSalary: number;
  /** Stored so the result and certificate can call a stand-in a stand-in. */
  salaryFromCareer: boolean;
  repaymentAsPctOfSalary: number; // monthlyRepayment / estimatedStartingSalary * 100
}

/** Standard amortised payment; 0 for nothing borrowed. */
function amortised(principal: number, annualRate: number, years: number): number {
  if (principal <= 0) return 0;
  const r = annualRate / 12;
  const n = years * 12;
  if (r === 0) return Math.round(principal / n);
  return Math.round((principal * r) / (1 - Math.pow(1 + r, -n)));
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
  const monthlyRepayment = amortised(loanAmount, LOAN_ANNUAL_RATE, LOAN_REPAYMENT_YEARS);
  const totalInterest =
    loanAmount > 0 ? monthlyRepayment * LOAN_REPAYMENT_YEARS * 12 - loanAmount : 0;
  const estimatedStartingSalary = Math.max(0, Math.round(input.startingSalary));
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
    annualRate: LOAN_ANNUAL_RATE,
    totalInterest,
    estimatedStartingSalary,
    salaryFromCareer: input.salaryFromCareer,
    repaymentAsPctOfSalary,
  };
}
