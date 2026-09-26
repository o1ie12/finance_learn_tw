/**
 * 報稅實作模擬 (報稅線 terminal) — pure, testable math.
 *
 * Replaces the original simulation, which asked the student to pick one of
 * three characters and then computed the entire return for them. That was a
 * selection, not a decision: the course teaches what gets deducted from a
 * payslip (station 19) and how 免稅額/扣除額/級距 actually work (station 20),
 * and the student exercised neither. Its stamp named which character had been
 * chosen, which is the clearest sign there was nothing to grade.
 *
 * So the student now files the return themselves, in three steps, and each
 * step is a commitment they then see the consequence of:
 *
 *   1. Guess the take-home pay from a monthly salary, then see what was
 *      actually withheld. Station 19, made concrete.
 *   2. Choose which amounts come off before tax is calculated. Station 20's
 *      first half.
 *   3. Choose HOW the tax is calculated. Station 20's second half, and the
 *      misconception it exists to correct — the student's own method produces
 *      a number, and the gap against the real one is the lesson.
 *
 * The cast also changed, because the old one could not demonstrate the
 * lesson: with the standard deductions applied, two of the three characters
 * owed no tax at all and the third sat in the lowest bracket, so the
 * progressive-rate point was unreachable no matter what the student did.
 *
 * Figures are illustrative for a recent filing year and flagged for a
 * currency check before publish, same as other figure-bearing lines.
 */

/**
 * The filing year this simulation represents, with every figure that
 * depends on it in ONE object. 財政部 adjusts these when cumulative CPI
 * crosses 3%; the annual update is an edit here and nowhere else.
 *
 * 114年度 is the return filed in May 2026. It kept 113's figures (CPI rose
 * 2.29%, under the threshold). The previous set here mixed years: 免稅額 and
 * 標準扣除額 were 113's while 薪資所得特別扣除額 was still 112's 207,000, so
 * every return under-deducted by NT$11,000 and produced the wrong tax.
 *
 * For the next edit — 115年度 (filed May 2027) does change:
 *   personalExemption 101,000 / standardDeduction 136,000 /
 *   salaryDeductionCap 227,000. Brackets to be confirmed at that time.
 */
export const TAX_YEAR = {
  /** 民國 income year. Shown on screen so nobody has to guess. */
  year: 114,
  /** Calendar year the return is actually filed. */
  filedIn: 2026,
  personalExemption: 97000, // 免稅額
  standardDeduction: 131000, // 標準扣除額
  salaryDeductionCap: 218000, // 薪資所得特別扣除額上限
  // 綜所稅 progressive brackets — 「速算公式」: tax = net × rate − offset.
  brackets: [
    { upTo: 590000, rate: 0.05, offset: 0 },
    { upTo: 1330000, rate: 0.12, offset: 41300 },
    { upTo: 2660000, rate: 0.2, offset: 147700 },
    { upTo: 4980000, rate: 0.3, offset: 413700 },
    { upTo: Infinity, rate: 0.4, offset: 911700 },
  ],
} as const;

export const PERSONAL_EXEMPTION = TAX_YEAR.personalExemption;
export const STANDARD_DEDUCTION = TAX_YEAR.standardDeduction;
export const SALARY_DEDUCTION_CAP = TAX_YEAR.salaryDeductionCap;
export const BRACKETS = TAX_YEAR.brackets;

/**
 * Employee shares of 勞保 and 健保, SIMPLIFIED and said so on screen.
 *
 * The real 勞保 employee share depends on the year's premium rate and the
 * insured-salary bracket, and 健保 on dependants. These are rounded stand-ins
 * that make the one point this step needs — take-home is not salary — and the
 * payslip reveal labels them as estimates rather than presenting them exact.
 */
export const LABOR_INSURANCE_RATE = 0.021; // 勞保自付（簡化）
export const HEALTH_INSURANCE_RATE = 0.0155; // 健保自付（簡化）
export const INSURANCE_RATES_SIMPLIFIED = true;

export type CharacterId = "mingming" | "amei" | "hao";

export interface TaxCharacter {
  id: CharacterId;
  name: string;
  role: string;
  annualIncome: number;
  /** Withheld by the employer through the year. */
  withheld: number;
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
    role: "社會新鮮人，年中領到一筆年終獎金",
    annualIncome: 550000,
    withheld: 4000,
  },
  {
    // Deliberately further into a career than the other two. Without someone
    // above the first bracket, the student can pick the wrong method in step
    // three and still land on the right number, which would teach the
    // opposite of the intended lesson.
    id: "hao",
    name: "阿豪",
    role: "工作幾年後的上班族，收入跨過第一個級距",
    annualIncome: 1200000,
    withheld: 60000,
  },
];

export function getCharacter(id: string): TaxCharacter | undefined {
  return TAX_CHARACTERS.find((c) => c.id === id);
}
export function isCharacterId(v: unknown): v is CharacterId {
  return TAX_CHARACTERS.some((c) => c.id === v);
}

// --- step 2: what actually comes off before tax ------------------------------

export interface DeductionOption {
  id: string;
  label: string;
  /** Part of the standard calculation every salaried filer gets. */
  applies: boolean;
  note: string;
}

export const DEDUCTION_OPTIONS: DeductionOption[] = [
  {
    id: "exemption",
    label: "免稅額",
    applies: true,
    note: "每個納稅人都有的基本額度。",
  },
  {
    id: "standard",
    label: "標準扣除額",
    applies: true,
    note: "不用逐筆列舉單據就能扣的固定金額。",
  },
  {
    id: "salary",
    label: "薪資所得特別扣除額",
    applies: true,
    note: "有薪資所得的人適用，有上限。",
  },
  {
    id: "phone",
    label: "今年繳的手機費",
    applies: false,
    note: "一般生活支出不能拿來扣稅，這是很常見的誤解。",
  },
];

export const CORRECT_DEDUCTION_IDS = DEDUCTION_OPTIONS.filter((d) => d.applies)
  .map((d) => d.id)
  .sort();

// --- step 3: how the tax is worked out ---------------------------------------

export type TaxMethod = "gross" | "bracket" | "flat_top";

export interface MethodOption {
  id: TaxMethod;
  label: string;
  correct: boolean;
  why: string;
}

export const METHOD_OPTIONS: MethodOption[] = [
  {
    id: "gross",
    label: "用「全年收入」直接乘上稅率",
    correct: false,
    why: "扣除額要先減掉。用收入直接乘，算出來的稅會比實際高很多。",
  },
  {
    id: "bracket",
    label: "用「所得淨額」算，超過級距的部分才用比較高的稅率",
    correct: true,
    why: "這就是累進稅率的運作方式，也是速算公式在做的事。",
  },
  {
    id: "flat_top",
    label: "用「所得淨額」全部乘上最高的那一個級距稅率",
    correct: false,
    why: "累進稅率不是超過某個級距，全部金額就都用高稅率算——只有超過的那一段才用。",
  },
];

// --- computation --------------------------------------------------------------

export interface Payslip {
  monthlySalary: number;
  laborInsurance: number;
  healthInsurance: number;
  taxWithheld: number;
  takeHome: number;
}

export function payslipFor(c: TaxCharacter): Payslip {
  const monthlySalary = Math.round(c.annualIncome / 12);
  const laborInsurance = Math.round(monthlySalary * LABOR_INSURANCE_RATE);
  const healthInsurance = Math.round(monthlySalary * HEALTH_INSURANCE_RATE);
  const taxWithheld = Math.round(c.withheld / 12);
  return {
    monthlySalary,
    laborInsurance,
    healthInsurance,
    taxWithheld,
    takeHome: monthlySalary - laborInsurance - healthInsurance - taxWithheld,
  };
}

/** Three take-home figures to choose between; only one is right. */
export function payslipChoices(p: Payslip): number[] {
  return [
    p.monthlySalary, // "surely I get what the contract says"
    p.takeHome,
    Math.round(p.monthlySalary * 0.8), // over-estimates the deductions
  ].sort((a, b) => b - a);
}

export function netIncomeFor(c: TaxCharacter): number {
  const salaryDeduction = Math.min(SALARY_DEDUCTION_CAP, c.annualIncome);
  return Math.max(
    0,
    c.annualIncome - PERSONAL_EXEMPTION - STANDARD_DEDUCTION - salaryDeduction,
  );
}

export function bracketFor(net: number) {
  return BRACKETS.find((b) => net <= b.upTo) ?? BRACKETS[BRACKETS.length - 1];
}

/** The correct tax, by the 速算公式. */
export function correctTax(net: number): number {
  const b = bracketFor(net);
  return Math.max(0, Math.round(net * b.rate - b.offset));
}

/** What the student's chosen method actually produces. */
export function taxByMethod(
  method: TaxMethod,
  c: TaxCharacter,
  net: number,
): number {
  const b = bracketFor(net);
  switch (method) {
    case "gross":
      return Math.max(0, Math.round(c.annualIncome * b.rate));
    case "flat_top":
      return Math.max(0, Math.round(net * b.rate));
    case "bracket":
      return correctTax(net);
  }
}

export interface TaxFilingInput {
  characterId: CharacterId;
  /** The take-home figure the student picked in step one. */
  payslipGuess: number;
  /** Which deductions they chose to apply. */
  deductionIds: string[];
  method: TaxMethod;
}

export interface TaxFilingOutcome {
  character: TaxCharacter;
  payslip: Payslip;
  payslipGuess: number;
  payslipCorrect: boolean;

  deductionIds: string[];
  deductionsCorrect: boolean;
  netIncome: number;

  method: TaxMethod;
  methodCorrect: boolean;
  /** What the student's method produced. */
  studentTax: number;
  /** What the return actually owes. */
  taxOwed: number;
  /** studentTax − taxOwed. Positive means they over-calculated. */
  taxGap: number;
  bracketRate: number;

  withheld: number;
  /** withheld − taxOwed; positive is a refund. */
  balance: number;
  isRefund: boolean;
  /** 0–3. */
  stepsCorrect: number;
}

export function computeTaxFiling(input: TaxFilingInput): TaxFilingOutcome {
  const character = getCharacter(input.characterId) ?? TAX_CHARACTERS[0];
  const payslip = payslipFor(character);
  const payslipCorrect = input.payslipGuess === payslip.takeHome;

  const picked = [...new Set(input.deductionIds)].sort();
  const deductionsCorrect =
    picked.length === CORRECT_DEDUCTION_IDS.length &&
    picked.every((id, i) => id === CORRECT_DEDUCTION_IDS[i]);

  // The net income is always the real one. The student's step-two answer is
  // graded, but a wrong pick does not corrupt the rest of the return — the
  // point is to show them the correct figure, not to compound the error into
  // a number nobody can learn anything from.
  const netIncome = netIncomeFor(character);
  const bracket = bracketFor(netIncome);
  const taxOwed = correctTax(netIncome);
  const studentTax = taxByMethod(input.method, character, netIncome);
  const methodCorrect =
    METHOD_OPTIONS.find((m) => m.id === input.method)?.correct ?? false;

  const balance = character.withheld - taxOwed;

  return {
    character,
    payslip,
    payslipGuess: input.payslipGuess,
    payslipCorrect,
    deductionIds: picked,
    deductionsCorrect,
    netIncome,
    method: input.method,
    methodCorrect,
    studentTax,
    taxOwed,
    taxGap: studentTax - taxOwed,
    bracketRate: bracket.rate,
    withheld: character.withheld,
    balance,
    isRefund: balance >= 0,
    stepsCorrect:
      (payslipCorrect ? 1 : 0) +
      (deductionsCorrect ? 1 : 0) +
      (methodCorrect ? 1 : 0),
  };
}

export function isTaxMethod(v: unknown): v is TaxMethod {
  return METHOD_OPTIONS.some((m) => m.id === v);
}
