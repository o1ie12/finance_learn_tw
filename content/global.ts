/**
 * Global content (04 §1): the why, the money cycle, onboarding goal cards and
 * SMART ticks. Copy is 04's wording verbatim.
 */
import type { LessonCard } from "@/lib/tasks/types";

/** 04 §1.1. Shown on onboarding, the dashboard help, and the end of every line. */
export const WHY_TEXT: string[] = [
  "錢是用來換選擇的。",
  "管好錢，你就多一點選擇：選工作、選住哪裡、選要不要冒險。",
  "不管錢的代價，是焦慮、衝動消費，還有月底心慌。",
];

/** 04 §1.2. One lesson card on the first station of the course. */
export const MONEY_CYCLE: LessonCard = {
  kind: "flow",
  title: "錢的七件事",
  steps: [
    "賺：用工作換收入",
    "存：為目標先留住錢",
    "花：有計畫地花",
    "借：守住信用，量力而為",
    "保：把大又少見的風險轉出去",
    "投：讓錢替你工作，也投資自己",
    "助：幫助別人，也是錢的用途",
  ],
  caption:
    "你每天都在做這些決定，只是沒發現：早餐要不要加飲料？手機一次買還是分期？同學都去玩，我要不要跟？",
};

export interface GoalCard {
  id: string;
  label: string;
  /**
   * NT$. "essentials3" = 3 × the starter monthly essentials, computed by code.
   * null = blank (自己寫).
   */
  amount: number | "essentials3" | null;
  /** null = blank (自己寫). */
  months: number | null;
}

/** 04 §1.3 goal cards (onboarding step 2). Default amounts are 示意 targets the student edits. */
export const GOAL_CARDS: GoalCard[] = [
  { id: "laptop", label: "一台新筆電", amount: 30000, months: 12 },
  { id: "grad_trip", label: "畢業旅行", amount: 20000, months: 10 },
  { id: "scooter", label: "第一台機車", amount: 45000, months: 18 },
  { id: "emergency", label: "三個月的緊急預備金", amount: "essentials3", months: 12 },
  { id: "skill", label: "學一項技能", amount: 12000, months: 6 },
  { id: "custom", label: "自己寫", amount: null, months: null },
];

export interface SmartTick {
  id: "specific" | "measurable" | "achievable" | "relevant" | "timebound";
  label: string;
  /** Shown when the tick is not met. `{X}` = the monthly amount, filled by code. */
  hint: string;
}

/**
 * 04 §1.3 SMART ticks. Rules (implemented in code):
 * specific = name filled; measurable = amount > 0; achievable = amount ÷ months
 * ≤ the starter job's monthly money left after essentials; relevant = a reason
 * with ticksRelevant true; timebound = 1 to 60 months.
 */
export const SMART_TICKS: SmartTick[] = [
  { id: "specific", label: "具體", hint: "要存錢買什麼？寫清楚一點。" },
  { id: "measurable", label: "可衡量", hint: "目標要有金額，才知道離終點多遠。" },
  {
    id: "achievable",
    label: "做得到",
    hint: "每個月要存 NT${X}，超過你目前能存的。試試拉長時間或降低金額。",
  },
  { id: "relevant", label: "相關", hint: "別人有，不一定代表你需要。這個目標對你重要嗎？" },
  { id: "timebound", label: "有期限", hint: "給自己一個期限。" },
];

/** 04 §1.3, below the ticks. `{X}` = amount ÷ months, rounded up to NT$100. */
export const GOAL_MONTHLY_LINE = "每個月要存：NT${X}";

export interface GoalReason {
  id: string;
  label: string;
  /** Whether picking this reason ticks 相關. */
  ticksRelevant: boolean;
}

/** 04 §1.3 reasons for the 相關 tick. */
export const GOAL_REASONS: GoalReason[] = [
  { id: "important", label: "對我很重要", ticksRelevant: true },
  { id: "safety", label: "讓生活更安全", ticksRelevant: true },
  { id: "future", label: "為了未來的自己", ticksRelevant: true },
  { id: "others", label: "別人都有", ticksRelevant: false },
];
