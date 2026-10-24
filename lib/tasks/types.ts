/**
 * The task engine's data model (03-TASK-ENGINE §1, §2). Content is data:
 * every line's stations are `StationLesson`s in content/lines/<slug>.ts, and
 * the engine renders, scores and stores them.
 *
 * Answers that depend on a formula (payroll, card interest, loans) are never
 * typed into content as numbers: content names a `ComputeRef` and
 * lib/tasks/compute.ts works it out from the repo's constants (04 header:
 * "code wins").
 */

import type { LineSlug as LinesSlug } from "@/lib/lines";

/** Derived from lib/lines.ts; never written by hand (消費線 is 'qixin'). */
export type LineSlug = LinesSlug;

// --- station lesson ---------------------------------------------------------------

export interface StationLesson {
  /** Existing module number from lib/modules.ts; null for a 加碼任務 or the terminal. */
  stationId: number | null;
  /** Where this task set runs (plan.md §2.3). */
  placement: "station" | "terminal" | "library";
  hook: Hook;
  lessonCards: LessonCard[]; // 1 to 3
  task: TaskSet;
  reveal: BiasReveal;
  takeaway: Takeaway;
  minutes: number; // shown on today's stop; default 15
  lifeGameTurn: boolean; // run one turn after the station (default true)
  /** One line for today's stop: what the student will do. */
  doLine?: string;
}

/** No correct answer. 2 to 4 options. */
export interface Hook {
  question: string;
  options: { id: string; label: string }[];
}

export interface Side {
  name: string;
  rows: { label: string; value: string }[];
}

export type LessonCard =
  | { kind: "text"; title: string; body: string } // body ≤ 80 characters
  | { kind: "compare"; title: string; left: Side; right: Side; note?: string }
  | { kind: "flow"; title: string; steps: string[]; caption?: string }
  | {
      kind: "matrix";
      title: string;
      xLabel: [string, string];
      yLabel: [string, string];
      /** Order: [low-x low-y, high-x low-y, low-x high-y, high-x high-y]. */
      cells: [string, string, string, string];
      axisTitles?: { x: string; y: string };
    }
  | { kind: "formula"; title: string; formula: string; example: string };

// --- task set ---------------------------------------------------------------------

/**
 * The brief (06 F3.1, amending 03): who is asking, what you will learn,
 * what you will do, and how long it takes. Shown as a message card before
 * the first document.
 */
export interface Brief {
  /** Fictional; the organisation is marked 名稱皆為虛構 on screen. */
  from: { name: string; role: string; org: string };
  /** What they ask of you, in their voice: 1 or 2 sentences, at most 60 characters. */
  message: string;
  /** One line. */
  learn: string;
  /** One line. */
  do: string;
  minutes: number;
}

export interface TaskSet {
  /** Stable, e.g. 'xinyong.bank.v1'. */
  id: string;
  /** Result kind, `<line>_<task>_v1`, e.g. 'xinyong_bank_v1'. Registered in lib/tasks/kinds.ts. */
  kind: string;
  title: string;
  brief: Brief;
  materials: Material[];
  steps: TaskStep[]; // 1 to 6
  passScore: number; // 0..1, default 0.6
  /** Shown after the model answers (e.g. 存錢線's 52-week tip). */
  afterTip?: string;
}

// --- materials (01 §8) ------------------------------------------------------------
// Field ids: a FindStep target names a field by its id. Each document type's
// ids are fixed and listed on its data type below.

export interface PayslipData {
  company: string;
  month: string; // e.g. "2026/07"
  /** Gross salary; the document computes 勞保/健保/net from TAX_YEAR.payroll. */
  gross: number;
  overtime?: number;
  pensionRate?: number;
}
// Field ids: company, month, base, overtime, gross, labor, health, pension, net

export interface CardStatementData {
  bank: string;
  month: string; // 帳單月份, e.g. "2026/10"
  closingDate: string; // 結帳日 "10/15"
  dueDate: string; // 繳款截止日 "10/30"
  limit: number;
  transactions: { date: string; postDate: string; desc: string; amount: number }[];
  /** Total due; if omitted, the sum of transactions. */
  totalDue?: number;
  interest: number; // 本期循環利息
  // 最低應繳 is computed by the document from creditCard.ts minimumPaymentFor.
}
// Field ids: bank, month, closingDate, dueDate, totalDue, minimumDue, interest,
// limit, col:date, col:postDate, col:desc, col:amount, tx:<i>

export interface CreditReportData {
  name: string;
  age: number;
  job: string;
  income: string; // shown as written ("52,000", "平均 38,000，近半年 26,000 到 60,000")
  tenure: string; // 年資
  cards: { count: string; utilization: string; late12: string };
  loans: string; // 每月要還
  inquiries3m: string;
  guarantor: string;
  derogatory: string; // 停卡 / 呆帳
  score: string; // "680" or "無資料"
  application: string;
}
// Field ids: name, age, job, income, tenure, cards.count, cards.utilization,
// cards.late12, loans, inquiries3m, guarantor, derogatory, score, application

export interface ChatData {
  contact: string;
  /** Messages; `from: "me"` is the student. */
  messages: { time: string; from: "them" | "me"; text: string; image?: string }[];
  /** "chat" (default) or "call" (a call transcript shown as a chat). */
  mode?: "chat" | "call";
}
// Field ids: msg:<i>

export interface BillSheetData {
  title: string;
  rows: { item: string; amount: number; day?: string }[];
}
// Field ids: row:<i>, total

export interface LedgerData {
  rows: { label: string; value: number | null }[]; // null = blank cell
}
// Field ids: row:<i>

export interface PolicyData {
  insurer: string;
  type: string; // 險種
  premium: string;
  term: string; // 繳費年期
  coverage: string[];
  exclusions: string[];
}
// Field ids: insurer, type, premium, term, coverage:<i>, exclusions:<i>

export interface LeaseData {
  /** Clause ids from lib/sims/leaseContract.ts to show; empty = all. */
  clauseIds?: string[];
}

export interface SnapshotData {
  name: string;
  rows: { label: string; value: string }[];
}
// Field ids: row:<i>

export interface PriceChartData {
  title: string;
  /** Monthly closes. Content may leave it empty and set `source` to compute from SEED_ROWS. */
  series: { month: string; close: number }[];
  markMonth?: string;
  source?: { ticker: "0050" | "0056"; window: "biggestFall12" };
}

export interface NewsCardData {
  headline: string;
  body: string;
  dateLabel: string;
}

export type Material =
  | { kind: "payslip"; data: PayslipData }
  | { kind: "cardStatement"; data: CardStatementData }
  | { kind: "creditReport"; data: CreditReportData }
  | { kind: "chat"; data: ChatData }
  | { kind: "billSheet"; data: BillSheetData }
  | { kind: "ledger"; data: LedgerData }
  | { kind: "policy"; data: PolicyData }
  | { kind: "lease"; data: LeaseData }
  | { kind: "snapshot"; data: SnapshotData }
  | { kind: "priceChart"; data: PriceChartData }
  | { kind: "newsCard"; data: NewsCardData };

// --- steps (03 §2) -----------------------------------------------------------------

/** Partial or full credit for an extra answer (03 §2 `accept`). */
export type Accept = string | { option: string; credit: number };

interface StepBase {
  id: string;
  prompt: string;
  /** false = reflection: no right answer, no score, shows 「沒有標準答案」. */
  scored?: boolean;
  /** The model answer's explanation (required for scored steps). */
  explanation: string;
  /** Saved to the student profile under this key (e.g. 'careerPriority'). */
  profileKey?: string;
}

export interface ChoiceStep extends StepBase {
  type: "choice";
  options: { id: string; label: string; explain?: string }[];
  correct?: string; // option id; omitted when scored: false or when correctNearest decides it
  /**
   * The correct option is computed (05 A5): the option whose value is
   * nearest, on a log scale, to the engine's number for `ref`. A "{value}"
   * in the explanation is replaced with that number (NT$ formatted).
   */
  correctNearest?: { ref: ComputeRef; values: Record<string, number> };
  /** Options are an ordered scale (e.g. ranges): never shuffled (05 A7). */
  ordered?: boolean;
  accept?: Accept[];
  /** Optional reasons; scored only when 2 or more and `correctReason` is set. */
  reasons?: { id: string; label: string }[];
  correctReason?: string;
}

export interface RateStep extends StepBase {
  type: "rate";
  scale: { value: 1 | 2 | 3; label: string }[];
  /** Each item points at a material (e.g. a creditReport) by index. */
  items: {
    id: string;
    label: string;
    materialIndex: number;
    answer: 1 | 2 | 3;
    /** Other ratings that also earn full credit (#10: 2 also gets 1). */
    alsoFull?: (1 | 2 | 3)[];
    explain: string; // 關鍵細節 → 後來
    highlight: string[]; // field ids of the report that mattered
  }[];
  /** Draw this many items per attempt (seeded); omitted = all. */
  drawCount?: number;
}

export interface FindStep extends StepBase {
  type: "find";
  materialIndex: number;
  targets: string[]; // field ids (empty in the public lesson)
  /** How many targets there are: the public lesson keeps this, not the ids (05 A2). */
  targetCount?: number;
  /** Why each target matters, keyed by field id. */
  explainTargets: Record<string, string>;
}

export type ComputeRef =
  | { fn: "netPay"; gross: number }
  | { fn: "netPayMinus"; gross: number; minus: number }
  | { fn: "cardMinimum"; total: number }
  | { fn: "cardInterestIfMinimum"; total: number }
  | { fn: "studentLoanMonthly"; principal: number }
  | { fn: "goalMonthly" } // the student's own onboarding goal, rounded up to NT$100
  | { fn: "depositInterest"; principal: number }; // one year at the 定存 rate

export interface NumberStep extends StepBase {
  type: "number";
  answer: number | ComputeRef;
  tolerance?: number; // default 0
  unit?: string; // "NT$" or "%"
}

export interface SortStep extends StepBase {
  type: "sort";
  boxes: { id: string; label: string }[]; // 2 to 6
  items: { id: string; label: string; box?: string; accept?: Accept[]; explain?: string }[];
}

export interface OrderStep extends StepBase {
  type: "order";
  items: { id: string; label: string }[];
  answer: string[]; // item ids in the correct order
}

export type TaskStep = ChoiceStep | RateStep | FindStep | NumberStep | SortStep | OrderStep;

// --- why-first ------------------------------------------------------------------------

export interface BiasReveal {
  bias: string; // e.g. '錨定效應'
  byHookOption?: Record<string, string>;
  outcomeFrom?: { stepId: string; map: Record<string, string> };
  byOutcome?: Record<string, string>;
  default: string; // ≤ 2 sentences
}
// Pick order: byOutcome (via outcomeFrom) → byHookOption → default.

export interface Takeaway {
  name: string;
  lines: string[];
}

// --- a line's content file -------------------------------------------------------

export interface LineContent {
  slug: LineSlug;
  /** 04 §2 overview row. */
  hook: Hook;
  bias: string;
  takeaway: Takeaway;
  /** What the line unlocks in the life game, shown on the line page. */
  unlocks: string;
  /** Task sets in order (Task A, B, ...). Placement is set on each. */
  lessons: StationLesson[];
  /**
   * For lines that keep their existing simulation as the terminal (職涯, 租屋,
   * 學貸, 報稅, 創業, 財務決策): the why-first wrapper around it, and any
   * steps that run after it (stored as `afterKind`).
   */
  terminal?: {
    lessonCards?: LessonCard[];
    reveal: BiasReveal;
    afterSteps?: TaskStep[];
    afterKind?: string;
    /** Text shown after the result (財務決策線's ending, with {name}). */
    endingText?: string;
  };
  /** Extra copy the line needs (e.g. lesson tips), keyed by name. */
  extras?: Record<string, string>;
}

// --- stored result (03 §4) ---------------------------------------------------------

export interface StepResult {
  stepId: string;
  answer: unknown;
  correct: number; // 0..1 credit; 1 for reflection steps
}

export interface TaskResult {
  kind: string;
  taskSetId: string;
  score: number; // sum of credits over scored steps
  total: number; // number of scored steps
  steps: StepResult[];
  hookAnswer: string | null;
  revealShown: string; // the reveal text that was picked
  provenance: Record<string, boolean>; // `known` flags for profile values used
  attempt: number;
  /** The order options, reasons and items were shown in (05 A7). */
  shown?: Record<string, { options?: string[]; reasons?: string[]; items?: string[] }>;
}
