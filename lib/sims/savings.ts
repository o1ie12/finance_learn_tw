/**
 * Savings Goal Simulator (存錢線 terminal) — pure, testable math.
 *
 * Models saving toward a goal over a timeframe: monthly deposit, where the
 * money is kept (compound rate), and temptation events. The outcome contrasts
 * the student's own path with "resist everything" vs "give in every time" to
 * make Module 3's compounding lesson (and Module 1's instant-gratification
 * trap) concrete. Modest, real savings rates — no fantasy returns.
 */

export const SAVINGS_GOALS = [
  { id: "concert", label: "演唱會＋周邊", amount: 8000 },
  { id: "trip", label: "畢業旅行", amount: 18000 },
  { id: "laptop", label: "一台筆電", amount: 25000 },
] as const;
export type SavingsGoalId = (typeof SAVINGS_GOALS)[number]["id"];

export const SAVINGS_STORAGE = [
  {
    id: "mattress",
    label: "放家裡（現金）",
    annualRate: 0,
    blurb: "最方便，但一毛利息都沒有，也最容易手癢花掉。",
  },
  {
    id: "bank",
    label: "銀行活存",
    annualRate: 0.006,
    blurb: "隨時可領，利息很低。",
  },
  {
    id: "timeDeposit",
    label: "郵局／銀行定存",
    annualRate: 0.016,
    blurb: "綁一段時間，利率最高，也比較不會亂動用。",
  },
] as const;
export type SavingsStorageId = (typeof SAVINGS_STORAGE)[number]["id"];

export const SAVINGS_MONTHS = [6, 12, 18] as const;

// Temptation events — labels fixed; months scale with the chosen timeframe.
const TEMPTATION_DEFS = [
  { key: "t1", amount: 350, label: "限量聯名手搖" },
  { key: "t2", amount: 1200, label: "朋友臨時揪的小旅行" },
  { key: "t3", amount: 1800, label: "喜歡的團演唱會門票" },
];

export interface Temptation {
  key: string;
  amount: number;
  label: string;
  month: number;
}

export function temptationsFor(months: number): Temptation[] {
  const positions = [0.3, 0.6, 0.85];
  return TEMPTATION_DEFS.map((t, i) => ({
    ...t,
    month: Math.min(months, Math.max(1, Math.round(months * positions[i]))),
  }));
}

export interface SavingsInput {
  goalId: SavingsGoalId;
  months: number;
  monthlyDeposit: number;
  storageId: SavingsStorageId;
  // one boolean per temptation (true = gave in), aligned with temptationsFor()
  temptationResponses: boolean[];
}

export interface SavingsScenario {
  label: string;
  finalAmount: number;
  deposited: number;
  tempted: number; // total spent on temptations
  interest: number; // growth from compounding (final vs net contributions)
  reachedGoal: boolean;
  gap: number; // amount − final (positive = short of goal)
}

export interface SavingsOutcome {
  goal: { id: SavingsGoalId; label: string; amount: number };
  months: number;
  monthlyDeposit: number;
  storage: { id: SavingsStorageId; label: string; annualRate: number };
  temptations: Temptation[];
  user: SavingsScenario;
  resistAll: SavingsScenario;
  giveInAll: SavingsScenario;
}

export function getGoal(id: string) {
  return SAVINGS_GOALS.find((g) => g.id === id);
}
export function getStorage(id: string) {
  return SAVINGS_STORAGE.find((s) => s.id === id);
}
export function isSavingsGoalId(v: unknown): v is SavingsGoalId {
  return SAVINGS_GOALS.some((g) => g.id === v);
}
export function isSavingsStorageId(v: unknown): v is SavingsStorageId {
  return SAVINGS_STORAGE.some((s) => s.id === v);
}

function simulate(
  monthlyDeposit: number,
  months: number,
  annualRate: number,
  spendByMonth: Map<number, number>,
  goalAmount: number,
  label: string,
): SavingsScenario {
  const r = annualRate / 12;
  let balance = 0;
  let deposited = 0;
  let tempted = 0;
  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + r) + monthlyDeposit;
    deposited += monthlyDeposit;
    const spend = spendByMonth.get(m) ?? 0;
    if (spend > 0) {
      balance -= spend;
      tempted += spend;
    }
  }
  const finalAmount = Math.max(0, Math.round(balance));
  const netContributions = deposited - tempted;
  return {
    label,
    finalAmount,
    deposited,
    tempted,
    interest: Math.max(0, finalAmount - netContributions),
    reachedGoal: finalAmount >= goalAmount,
    gap: goalAmount - finalAmount,
  };
}

export function computeSavings(input: SavingsInput): SavingsOutcome {
  const goal = getGoal(input.goalId) ?? SAVINGS_GOALS[0];
  const storage = getStorage(input.storageId) ?? SAVINGS_STORAGE[0];
  const months = SAVINGS_MONTHS.includes(
    input.months as (typeof SAVINGS_MONTHS)[number],
  )
    ? input.months
    : 12;
  const monthlyDeposit = Math.max(0, Math.round(input.monthlyDeposit));
  const temptations = temptationsFor(months);

  const all = new Map(temptations.map((t) => [t.month, t.amount]));
  const none = new Map<number, number>();
  const userMap = new Map<number, number>();
  temptations.forEach((t, i) => {
    if (input.temptationResponses[i]) userMap.set(t.month, t.amount);
  });

  return {
    goal: { id: goal.id, label: goal.label, amount: goal.amount },
    months,
    monthlyDeposit,
    storage: { id: storage.id, label: storage.label, annualRate: storage.annualRate },
    temptations,
    user: simulate(monthlyDeposit, months, storage.annualRate, userMap, goal.amount, "你的選擇"),
    resistAll: simulate(monthlyDeposit, months, storage.annualRate, none, goal.amount, "守住計畫"),
    giveInAll: simulate(monthlyDeposit, months, storage.annualRate, all, goal.amount, "每次都心動"),
  };
}
