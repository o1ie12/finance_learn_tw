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
 * Post-graduation interest the student pays: 0.775% a year for loans repaid
 * from 115-08-01 (政府 now covers 1% of the 1.775% student rate).
 *
 * Sources, checked 2026-10-06:
 *  - 臺灣銀行 (the lender), 115學年度 就學貸款 announcement, 2026-07; the
 *    sloan.bot.com.tw page did not load for us — the same figure is in the
 *    國教署 notice below and in CNA/LTN/UDN reports of 臺灣銀行's release.
 *  - 國教署 臺教國署高字第1155403540號 (115-07-20); text checked via the
 *    「115學年度高級中等學校學生申請就學貸款注意事項」 a school reposted:
 *    https://www.lksh.chc.edu.tw/var/file/5/1005/img/28/763107554.pdf
 *    措施三「…原學生負擔利率為1.775%，調降至0.775%。」
 *  - In-school interest borne in full by government: 高級中等以上學校學生
 *    就學貸款辦法 §8 I; repayment begins 滿二年之次日 after graduation:
 *    §11 II; both in force from 115-08-01 (§16). edu.law.moe.gov.tw FL008414.
 */
export const LOAN_ANNUAL_RATE = 0.00775;

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
/**
 * Repayment length. ILLUSTRATIVE: the 辦法 sets when repayment starts (§11 II)
 * but the length depends on how many semesters were borrowed and on the
 * bank's terms, and we did not find it stated in a primary source. Labelled
 * so on screen.
 */
export const LOAN_REPAYMENT_YEARS = 10;
/** 寬限期: repayment starts the day after two full years from graduation,
 * 寬限期內免還本息 (就學貸款辦法 §11 II, from 115-08-01). */
export const GRACE_YEARS = 2;

export interface LoanPhase {
  id: "school" | "grace" | "repay";
  label: string;
  years: number;
  /** What the student pays each month in this phase. */
  monthly: number;
  /** What the student pays across the whole phase. */
  total: number;
  note: string;
}

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
  graceYears: number;
  repaymentYears: number;
  /** In school → grace → repayment, with what each costs the student. */
  phases: LoanPhase[];
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
    graceYears: GRACE_YEARS,
    repaymentYears: LOAN_REPAYMENT_YEARS,
    phases: [
      {
        id: "school",
        label: "在學期間",
        years: YEARS,
        monthly: 0,
        total: 0,
        note: "利息由政府全額負擔，你不用付利息，也還不用還本金。",
      },
      {
        id: "grace",
        label: "畢業後寬限期",
        years: GRACE_YEARS,
        monthly: 0,
        total: 0,
        note: "畢業滿 2 年之前免還本息，可以先找工作、站穩腳步。",
      },
      {
        id: "repay",
        label: "按月攤還",
        years: LOAN_REPAYMENT_YEARS,
        monthly: monthlyRepayment,
        total: loanAmount > 0 ? monthlyRepayment * LOAN_REPAYMENT_YEARS * 12 : 0,
        note: `年利率 ${(LOAN_ANNUAL_RATE * 100).toFixed(3)}%（學生負擔），本金加利息一起按月還。`,
      },
    ],
  };
}
